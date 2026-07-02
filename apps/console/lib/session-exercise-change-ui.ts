import {
  isDirectExerciseSelectionDisabled,
  isSkipControlDisabled,
  type ExerciseListHighlightState,
  type PendingExerciseChange,
  type SkipDirection,
} from './session-exercise-skip.js'

export const EXERCISE_CHANGE_ACK_TIMEOUT_MS = 15_000

export type SkipControlDisabledReason = 'pending' | 'boundary' | null

export const EXERCISE_LIST_HIGHLIGHT_LABEL = {
  confirmed: 'Current (headset)',
  pending: 'Pending change',
} as const

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
    return 'Waiting for the headset to confirm the exercise change.'
  }

  if (reason === 'boundary') {
    if (direction === 'forward') {
      return 'Last exercise — forward skip is not available.'
    }

    return 'First exercise — back skip is not available.'
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
    return 'Exercise list selection is disabled while a headset exercise change is in flight.'
  }

  return undefined
}

export function resolveExerciseChangeStatusMessage(input: {
  confirmedExerciseName: string
  pendingExerciseName: string
}): string {
  return `Waiting for headset to confirm change from ${input.confirmedExerciseName} to ${input.pendingExerciseName}. Sets and reps show the headset-confirmed exercise.`
}

export function resolveExerciseChangeFailureMessage(
  confirmedExerciseName: string,
): string {
  return `Exercise change timed out. ${confirmedExerciseName} remains the current headset exercise.`
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
