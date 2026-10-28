import { useMemo } from 'react'
import { getUUID } from '@/lib/utils'
import { withRom } from '@/lib/with-rom'
import { insertBilateralSiblingRow } from '@/lib/program-list-bilateral-insert'
import { useExerciseLibrary } from '@/context/exercise-library-context'
import { useExercise } from '@virtality/react-query'
import {
  segmentProgramExerciseRowsByAdjacentBilateralFamilies,
  type NearTermDirection,
} from '@virtality/shared/utils'
import {
  bulkSelectableRowIds,
  enabledMemberIds,
  isDeferredRemoval,
  isGlobalCheckSatisfied,
  segmentCheckboxChecked,
  toDeferredRemovalIdSet,
} from '@/lib/program-list-deferred-removal'
import {
  catalogVariantForDirection,
  describeSegment,
  membersForSegment,
  programMemberForDirection,
  segmentRowKey,
  type SegmentRow,
} from './exercise-library-list-segments'

export type ExerciseLibraryListState = ReturnType<typeof useExerciseLibraryList>

export function useExerciseLibraryList() {
  const { state, handler } = useExerciseLibrary()
  const { data: defaultExercises } = useExercise()
  const { selectedExercises, globalCheck, selectedItems, deferredRemovalIds } =
    state

  const deferredRemoval = toDeferredRemovalIdSet(deferredRemovalIds)

  const {
    setLibraryOpen,
    updateExercises,
    updateFormState,
    markDeferredRemoval,
    unmarkDeferredRemoval,
  } = handler

  const exerciseList = useMemo(() => {
    return selectedExercises.map((ex) => ({
      ...ex,
      exercise: defaultExercises?.find((de) => de.id === ex.exerciseId),
    }))
  }, [selectedExercises, defaultExercises])

  const segments = useMemo(
    () =>
      segmentProgramExerciseRowsByAdjacentBilateralFamilies(
        exerciseList.map(segmentRowKey),
      ),
    [exerciseList],
  )

  const rows = segments.map((seg) =>
    describeSegment(seg, exerciseList, defaultExercises, deferredRemoval),
  )

  const commitSelectedItems = (nextSelectedItems: string[]) => {
    updateFormState({
      selectedItems: nextSelectedItems,
      globalCheck: isGlobalCheckSatisfied(
        exerciseList,
        nextSelectedItems,
        deferredRemoval,
      ),
    })
  }

  const toggleSingleSelection = (exerciseId: string) => {
    const itemExists = selectedItems.find((item) => item === exerciseId)

    if (itemExists) {
      commitSelectedItems(selectedItems.filter((item) => item !== exerciseId))
    } else {
      commitSelectedItems([...selectedItems, exerciseId])
    }
  }

  const togglePairSelection = (memberIds: readonly string[]) => {
    const selectableIds = enabledMemberIds(memberIds, deferredRemoval)
    const allIn = selectableIds.every((id) => selectedItems.includes(id))
    if (allIn) {
      commitSelectedItems(
        selectedItems.filter((id) => !selectableIds.includes(id)),
      )
    } else {
      commitSelectedItems([...new Set([...selectedItems, ...selectableIds])])
    }
  }

  const toggleRowSelection = (row: SegmentRow) => {
    if (row.isPair) togglePairSelection(row.memberIds)
    else toggleSingleSelection(row.primary.id)
  }

  const isRowChecked = (row: SegmentRow) =>
    segmentCheckboxChecked(row.memberIds, selectedItems, deferredRemoval)

  const checkAll = (checked: boolean) => {
    const selectableIds = bulkSelectableRowIds(exerciseList, deferredRemoval)
    const newSelectedItems = checked ? selectableIds : []
    updateFormState({
      selectedItems: newSelectedItems,
      globalCheck: checked && selectableIds.length > 0,
    })
  }

  const deleteSelected = () => {
    const idsToRemove = new Set(selectedItems)

    const exercisesToUpdate = exerciseList.filter(
      (ex) => !idsToRemove.has(ex.id),
    )
    updateExercises(exercisesToUpdate)
    updateFormState({ globalCheck: false, selectedItems: [] })
  }

  const moveRow = (groupIndex: number, delta: -1 | 1) => {
    const j = groupIndex + delta
    if (j < 0 || j >= segments.length) return
    const groups = segments.map((s) => membersForSegment(exerciseList, s))
    const reordered = [...groups]
    ;[reordered[groupIndex], reordered[j]] = [
      reordered[j]!,
      reordered[groupIndex]!,
    ]
    updateExercises(reordered.flat())
  }

  const toggleDirection = (row: SegmentRow, side: NearTermDirection) => {
    const inProgram = programMemberForDirection(row.members, side)
    if (inProgram) {
      if (isDeferredRemoval(deferredRemoval, inProgram.id)) {
        unmarkDeferredRemoval(inProgram.id)
      } else {
        markDeferredRemoval(inProgram.id)
      }
      return
    }
    const catalogEx = catalogVariantForDirection(
      defaultExercises,
      row.familyDisplayName,
      side,
    )
    if (!catalogEx) return
    const newRow = withRom({
      exerciseId: catalogEx.id,
      id: getUUID(),
      reps: 10,
      sets: 3,
      restTime: 5,
      holdTime: 1,
      speed: 1.0,
      exercise: catalogEx,
    })
    updateExercises(
      insertBilateralSiblingRow(exerciseList, row.primaryIndex, side, newRow),
    )
  }

  return {
    exerciseList,
    rows,
    globalCheck,
    selectedItems,
    deferredRemoval,
    setLibraryOpen,
    updateExercises,
    toggleRowSelection,
    isRowChecked,
    checkAll,
    deleteSelected,
    moveRow,
    toggleDirection,
  }
}
