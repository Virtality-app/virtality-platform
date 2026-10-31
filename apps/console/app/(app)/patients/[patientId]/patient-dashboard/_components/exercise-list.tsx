'use client'
import { Fragment, useState } from 'react'
import { cn, getDisplayName } from '@/lib/utils'
import { usePatientDashboard } from '@/context/patient-dashboard-context'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@virtality/ui/components/card'
import { ItemGroup, ItemSeparator } from '@/components/ui/item'
import { useExercise } from '@virtality/react-query'
import { useClientT } from '@/i18n/use-client-t'
import {
  isDirectExerciseSelectionDisabled,
  resolveCurrentExerciseIndex,
  resolveExerciseListHighlightState,
} from '@/lib/session-exercise-skip'
import { resolveDirectSelectionBlockedTooltip } from '@/lib/session-exercise-change-ui'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@virtality/ui/components/tooltip'
import { ConfirmDialog } from '@/components/dialogs/confirm-dialog'
import ExerciseListRow from './exercise-list-row'
import { useExerciseListActions } from './use-exercise-list-actions'

type PendingJump = { index: number; exerciseId: string; name: string }

const ExerciseList = ({ className }: { className?: string }) => {
  const { state, currExercise } = usePatientDashboard()
  const {
    programState,
    selectedMode,
    exercises,
    activeExerciseData,
    pendingExerciseChange,
  } = state
  const { data: defaultExercises } = useExercise()
  const { t } = useClientT('patient-dashboard')
  const actions = useExerciseListActions()
  const [pendingJump, setPendingJump] = useState<PendingJump | null>(null)

  const isProgramActive = programState === 'started'
  const isProgramPaused = programState === 'paused'
  const isMain = selectedMode === 'main'
  const isActiveMainSession = (isProgramActive || isProgramPaused) && isMain
  const headsetConfirmedExerciseIndex = resolveCurrentExerciseIndex({
    exercises,
    activeExerciseId: activeExerciseData.id,
    fallbackIndex: currExercise.current,
  })
  const isDirectSelectionBlocked =
    isProgramActive &&
    isMain &&
    isDirectExerciseSelectionDisabled({ pendingExerciseChange })
  const directSelectionBlockedTooltip = resolveDirectSelectionBlockedTooltip(
    isDirectSelectionBlocked ? pendingExerciseChange : null,
  )

  // Mid-session, moving the headset to another exercise is a treatment
  // decision: ask first instead of acting on a stray tap.
  const handleSelect = (index: number, exerciseId: string, name: string) => {
    if (isProgramActive && isMain) {
      if (index === headsetConfirmedExerciseIndex) return
      setPendingJump({ index, exerciseId, name })
      return
    }
    actions.selectExercise(index, exerciseId)
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Card className={cn('gap-3', className)}>
        <CardHeader>
          <CardTitle>{t('exerciseList.title')}</CardTitle>
          {isDirectSelectionBlocked && directSelectionBlockedTooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <p className='text-xs text-amber-300'>
                  {t('exerciseList.selectionLocked')}
                </p>
              </TooltipTrigger>
              <TooltipContent>{directSelectionBlockedTooltip}</TooltipContent>
            </Tooltip>
          )}
        </CardHeader>
        <CardContent className='min-h-0 flex-1 overflow-auto p-2'>
          {exercises.length !== 0 ? (
            <ItemGroup>
              {exercises.map((ex, index) => {
                const defaultExercise = defaultExercises?.find(
                  (de) => de.id === ex.exerciseId,
                )
                const name = getDisplayName(defaultExercise) ?? ''

                return (
                  <Fragment key={ex.id}>
                    <ExerciseListRow
                      rowId={ex.id}
                      index={index}
                      exerciseName={name}
                      defaultExercise={defaultExercise}
                      highlightState={
                        isActiveMainSession
                          ? resolveExerciseListHighlightState({
                              exerciseIndex: index,
                              headsetConfirmedExerciseIndex,
                              pendingExerciseChange,
                            })
                          : null
                      }
                      isFirst={index === 0}
                      isLast={index === exercises.length - 1}
                      reorderLocked={isProgramActive || isProgramPaused}
                      selectionBlocked={isDirectSelectionBlocked}
                      onSelect={() => handleSelect(index, ex.exerciseId, name)}
                      onMove={actions.moveExercise}
                      onApply={actions.applySettings}
                      onApplyToAll={actions.applySettingsToAllExercises}
                    />
                    {index !== exercises.length - 1 && <ItemSeparator />}
                  </Fragment>
                )
              })}
            </ItemGroup>
          ) : (
            <p className='text-muted-foreground'>{t('exerciseList.empty')}</p>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={pendingJump !== null}
        onOpenChange={(open) => {
          if (!open) setPendingJump(null)
        }}
        title={t('jumpConfirm.title', { exercise: pendingJump?.name ?? '' })}
        description={t('jumpConfirm.description')}
        confirmLabel={t('jumpConfirm.confirm')}
        cancelLabel={t('jumpConfirm.cancel')}
        onConfirm={() => {
          if (pendingJump) {
            actions.selectExercise(pendingJump.index, pendingJump.exerciseId)
          }
        }}
      />
    </TooltipProvider>
  )
}

export default ExerciseList
