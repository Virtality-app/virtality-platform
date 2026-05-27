import { MouseEvent, useMemo } from 'react'
import {
  ChevronDown,
  ChevronUp,
  FolderClosed,
  Settings,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { cn, getDisplayName } from '@/lib/utils'
import ExerciseSettings from '@/components/ui/exercise-settings'
import { CompleteExercise, ExerciseWithSettings } from '@/types/models'
import ExerciseLibraryDialog from '@/components/ui/exercise-library-dialog'
import { P } from './typography'
import { useExerciseLibrary } from '@/context/exercise-library-context'
import { motion } from 'motion/react'
import { useExercise } from '@virtality/react-query'
import {
  segmentProgramExerciseRowsByAdjacentBilateralFamilies,
  type ProgramExerciseListSegment,
} from '@virtality/shared/utils'

interface ExerciseLibraryListProps {
  className?: string
}

function segmentRowKey(ex: CompleteExercise): {
  displayName: string
  direction: string
} {
  return {
    displayName: ex.exercise?.displayName ?? '',
    direction: ex.exercise?.direction ?? '',
  }
}

function membersForSegment(
  selectedExercises: CompleteExercise[],
  seg: ProgramExerciseListSegment,
): CompleteExercise[] {
  if (seg.kind === 'single') {
    return [selectedExercises[seg.startIndex]!]
  }
  return [
    selectedExercises[seg.startIndex]!,
    selectedExercises[seg.startIndex + 1]!,
  ]
}

const ExerciseLibraryList = ({ className }: ExerciseLibraryListProps) => {
  const { state, handler } = useExerciseLibrary()
  const { data: defaultExercises } = useExercise()
  const { selectedExercises, globalCheck, toggledSettings, selectedItems } =
    state

  const {
    setLibraryOpen,
    setToggledSettings,
    updateExercises,
    updateFormState,
  } = handler

  const segments = useMemo(
    () =>
      segmentProgramExerciseRowsByAdjacentBilateralFamilies(
        selectedExercises.map(segmentRowKey),
      ),
    [selectedExercises],
  )

  const toggleSettings = (e: MouseEvent) => {
    const { id } = e.currentTarget
    if (!id) return

    if (!toggledSettings) setToggledSettings({ [id]: true })
    else setToggledSettings({ [id]: !toggledSettings[id] })
  }

  const checkboxChange = (exercise: ExerciseWithSettings) => {
    const itemExists = selectedItems.find((item) => item === exercise.id)

    if (itemExists) {
      const newSelectedItems = selectedItems.filter(
        (item) => item !== exercise.id,
      )
      updateFormState({
        selectedItems: newSelectedItems,
        globalCheck: newSelectedItems.length === selectedExercises.length,
      })
    } else {
      const newSelectedItems = [...selectedItems, exercise.id]
      updateFormState({
        selectedItems: newSelectedItems,
        globalCheck: newSelectedItems.length === selectedExercises.length,
      })
    }
  }

  const pairCheckboxChange = (memberIds: readonly string[]) => {
    const allIn = memberIds.every((id) => selectedItems.includes(id))
    if (allIn) {
      const newSelectedItems = selectedItems.filter(
        (id) => !memberIds.includes(id),
      )
      updateFormState({
        selectedItems: newSelectedItems,
        globalCheck: newSelectedItems.length === selectedExercises.length,
      })
    } else {
      const next = new Set([...selectedItems, ...memberIds])
      const arr = [...next]
      updateFormState({
        selectedItems: arr,
        globalCheck: arr.length === selectedExercises.length,
      })
    }
  }

  const checkAll = (checked: boolean) => {
    const newSelectedItems = checked ? selectedExercises.map((e) => e.id) : []
    updateFormState({
      selectedItems: newSelectedItems,
      globalCheck: checked,
    })
  }

  const deleteSelected = () => {
    const exercisesToUpdate = selectedExercises.filter((ex) =>
      selectedItems.every((exToRemove) => exToRemove !== ex.id),
    )
    updateExercises(exercisesToUpdate)
    updateFormState({ globalCheck: false, selectedItems: [] })
  }

  const reorderSegmentGroups = (groupIndex: number, delta: -1 | 1) => {
    const j = groupIndex + delta
    if (j < 0 || j >= segments.length) return
    const groups = segments.map((s) =>
      membersForSegment(selectedExercises, s),
    )
    const reordered = [...groups]
    ;[reordered[groupIndex], reordered[j]] = [
      reordered[j]!,
      reordered[groupIndex]!,
    ]
    updateExercises(reordered.flat())
  }

  const isListEmpty = selectedExercises.length === 0

  return (
    <div className={cn('flex max-h-full w-full flex-col border', className)}>
      <div className='flex justify-between dark:bg-zinc-950'>
        <div className='flex items-center'>
          <Checkbox
            className='m-4'
            checked={globalCheck}
            onCheckedChange={checkAll}
          />
          <p className='text-muted-foreground text-sm'>Select all</p>
        </div>

        <div className='flex items-center gap-2'>
          <span>Exercise library</span>

          <Button
            variant='ghost'
            size='icon'
            onClick={() => setLibraryOpen(true)}
          >
            <FolderClosed />
          </Button>
        </div>

        <div className='flex items-center'>
          <span>Remove Selected</span>
          <Button
            size='icon'
            variant='destructive'
            onClick={deleteSelected}
            disabled={selectedItems.length === 0}
            className='m-4'
          >
            <Trash2 />
          </Button>
        </div>
      </div>
      <Separator />

      <ul className='flex max-h-full w-full flex-col gap-2 overflow-auto rounded-lg p-4 dark:text-zinc-200'>
        {!isListEmpty ? (
          segments.map((seg, groupIdx) => {
            const members = membersForSegment(selectedExercises, seg)
            const isPair = seg.kind === 'bilateral'
            const primary = members[0]!
            const secondary = members[1]
            const primaryIndex = seg.startIndex
            const secondaryIndex = isPair ? seg.startIndex + 1 : undefined

            const memberIds = members.map((m) => m.id)
            const allMembersSelected = memberIds.every((id) =>
              selectedItems.includes(id),
            )
            const someMembersSelected = memberIds.some((id) =>
              selectedItems.includes(id),
            )

            const primaryCatalog = defaultExercises?.find(
              (de) => de.id === primary.exerciseId,
            )

            const title = isPair
              ? (primary.exercise?.displayName ??
                primaryCatalog?.displayName ??
                'Exercise')
              : (getDisplayName(
                  defaultExercises?.find((de) => de.id === primary.exerciseId),
                ) ?? 'Exercise')

            const listKey = isPair ? `${primary.id}:${secondary!.id}` : primary.id

            return (
              <li key={listKey} className='space-y-2'>
                <motion.div
                  layout
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{
                    layout: { duration: 0.3, ease: 'easeInOut' },
                    opacity: { duration: 0.2 },
                    y: { duration: 0.2 },
                  }}
                  className='flex flex-col'
                >
                  <div className='flex items-center gap-2'>
                    <Checkbox
                      checked={
                        allMembersSelected
                          ? true
                          : someMembersSelected
                            ? 'indeterminate'
                            : false
                      }
                      onCheckedChange={() =>
                        isPair
                          ? pairCheckboxChange(memberIds)
                          : checkboxChange(primary)
                      }
                    />
                    <div className='flex flex-1 flex-col'>
                      <p>{title}</p>
                      {isPair ? (
                        <p className='text-muted-foreground text-xs'>
                          Left &amp; Right
                        </p>
                      ) : null}
                    </div>
                    <Button
                      id={primary.id}
                      type='button'
                      size='icon'
                      variant='outline'
                      onClick={toggleSettings}
                    >
                      <Settings className='size-4' />
                    </Button>
                  </div>

                  <div className='flex items-center gap-3'>
                    <div className='flex flex-col'>
                      <Button
                        size='icon-sm'
                        variant='ghost'
                        onClick={() => reorderSegmentGroups(groupIdx, -1)}
                        disabled={groupIdx === 0}
                      >
                        <ChevronUp />
                      </Button>
                      <Button
                        size='icon-sm'
                        variant='ghost'
                        onClick={() => reorderSegmentGroups(groupIdx, 1)}
                        disabled={groupIdx === segments.length - 1}
                      >
                        <ChevronDown />
                      </Button>
                    </div>
                    <div className='flex-1'>
                      {toggledSettings?.[primary.id] && (
                        <ExerciseSettings
                          key={primary.id}
                          ex={primary}
                          exercises={selectedExercises}
                          selectedItems={selectedItems}
                          index={primaryIndex}
                          unifiedSiblingIndex={secondaryIndex}
                          setExercises={updateExercises}
                        />
                      )}
                    </div>
                  </div>

                  {groupIdx === segments.length - 1 ? null : (
                    <Separator className='my-2' />
                  )}
                </motion.div>
              </li>
            )
          })
        ) : (
          <P>Exercise list is empty.</P>
        )}
      </ul>

      <ExerciseLibraryDialog />
    </div>
  )
}

export default ExerciseLibraryList
