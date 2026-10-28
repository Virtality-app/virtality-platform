import i18next from '@/i18n/i18next'
import {
  isDirectExerciseSelectionDisabled,
  isSkipControlDisabled,
  type ExerciseListHighlightState,
  type PendingExerciseChange,
  type SkipDirection,
} from './session-exercise-skip'

export const EXERCISE_CHANGE_ACK_TIMEOUT_MS = 15_000

export type SkipControlDisabledReason = 'pending' | 'boundary' | null

export function exerciseListHighlightLabel(
  highlightState: 'confirmed' | 'pending',
): string {
  return i18next.t(`exerciseList.highlight.${highlightState}`)
}

export function resolveSkipControlDisabledReason(input: {
  direction: SkipDirection
  currentExerciseIndex: number
  exerciseCount: number
  pendingExerciseChange: PendingExerciseChange | null
}): SkipControlDisabledReason {
  if (input.pendingExerciseChange) {
    return 'pending'
  }

  if (
    isSkipControlDisabled({
      direction: input.direction,
      currentExerciseIndex: input.currentExerciseIndex,
      exerciseCount: input.exerciseCount,
      pendingExerciseChange: null,
    })
  ) {
    return 'boundary'
  }

  return null
}

export function resolveSkipControlTooltip(
  reason: SkipControlDisabledReason,
  direction: SkipDirection,
): string | undefined {
  if (reason === 'pending') {
    return i18next.t('exerciseChange.skipPending')
  }

  if (reason === 'boundary') {
    if (direction === 'forward') {
      return i18next.t('exerciseChange.skipLast')
    }

    return i18next.t('exerciseChange.skipFirst')
  }

  return undefined
}

export function resolveSkipControlUiState(input: {
  direction: SkipDirection
  currentExerciseIndex: number
  exerciseCount: number
  pendingExerciseChange: PendingExerciseChange | null
}) {
  const disabledReason = resolveSkipControlDisabledReason(input)

  return {
    isDisabled: disabledReason !== null,
    disabledReason,
    tooltip: resolveSkipControlTooltip(disabledReason, input.direction),
  }
}

export function resolveDirectSelectionBlockedTooltip(
  pendingExerciseChange: PendingExerciseChange | null,
): string | undefined {
  if (isDirectExerciseSelectionDisabled({ pendingExerciseChange })) {
    return i18next.t('exerciseChange.selectionDisabled')
  }

  return undefined
}

export function resolveExerciseChangeStatusMessage(input: {
  confirmedExerciseName: string
  pendingExerciseName: string
}): string {
  return i18next.t('exerciseChange.status', {
    from: input.confirmedExerciseName,
    to: input.pendingExerciseName,
  })
}

export function resolveExerciseChangeFailureMessage(
  confirmedExerciseName: string,
): string {
  return i18next.t('exerciseChange.timedOut', { name: confirmedExerciseName })
}

export function resolveExerciseListHighlightClass(
  highlightState: ExerciseListHighlightState | null,
): string {
  switch (highlightState) {
    case 'confirmed':
      return 'ring-2 ring-green-500/60 bg-green-500/10'
    case 'pending':
      return 'ring-2 ring-amber-500/60 bg-amber-500/10'
    default:
      return ''
  }
}

export function resolveExerciseListHighlightBadgeClass(
  highlightState: ExerciseListHighlightState,
): string {
  switch (highlightState) {
    case 'confirmed':
      return 'bg-green-500/20 text-green-300'
    case 'pending':
      return 'bg-amber-500/20 text-amber-300'
  }
}

export function shouldShowExerciseListHighlightBadge(
  highlightState: ExerciseListHighlightState | null,
): highlightState is 'pending' {
  return highlightState === 'pending'
}

export function resolveSessionExerciseChangeStatusItemClass(): string {
  return 'max-h-9 min-w-0 shrink flex-nowrap items-center gap-1.5 border-amber-500/40 bg-amber-500/10 px-2 py-1 text-amber-100'
}

export function resolveSessionExerciseChangeStatusMessageClass(): string {
  return 'truncate text-xs leading-none'
}
