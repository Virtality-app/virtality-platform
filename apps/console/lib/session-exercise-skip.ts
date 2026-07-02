import type { ProgressDataPoint } from '@/types/models'

export type SkipDirection = 'forward' | 'back'

export type PendingExerciseChange = {
  targetExerciseIndex: number
  sourceExerciseIndex: number
  sourceExerciseId: string
}

export function resolveCurrentExerciseIndex(input: {
  exercises: ReadonlyArray<{ exerciseId: string }> | undefined
  activeExerciseId: string | null
  fallbackIndex: number
}): number {
  const index = input.exercises?.findIndex(
    (exercise) => exercise.exerciseId === input.activeExerciseId,
  )

  return index ?? input.fallbackIndex
}

export function resolveForwardBackSkipTarget(input: {
  currentExerciseIndex: number
  exerciseCount: number
  direction: SkipDirection
}): number | null {
  if (input.direction === 'forward') {
    if (input.currentExerciseIndex >= input.exerciseCount - 1) {
      return null
    }

    return input.currentExerciseIndex + 1
  }

  if (input.currentExerciseIndex <= 0) {
    return null
  }

  return input.currentExerciseIndex - 1
}

export function isSkipControlDisabled(input: {
  direction: SkipDirection
  currentExerciseIndex: number
  exerciseCount: number
  pendingExerciseChange: PendingExerciseChange | null
}): boolean {
  if (input.pendingExerciseChange !== null) {
    return true
  }

  if (input.direction === 'forward') {
    return input.currentExerciseIndex >= input.exerciseCount - 1
  }

  return input.currentExerciseIndex <= 0
}

export function extractCompletedProgressPoints(
  progressPoints: ReadonlyArray<ProgressDataPoint>,
): ProgressDataPoint[] {
  return progressPoints.filter((point) =>
    Object.entries(point).some(
      ([key, value]) => key.startsWith('set_') && typeof value === 'number',
    ),
  )
}

export function shouldIgnoreProgressEventDuringPendingExerciseChange(input: {
  pendingExerciseChange: PendingExerciseChange | null
  eventExerciseIndex: number
  eventExerciseId: string
}): boolean {
  if (!input.pendingExerciseChange) {
    return false
  }

  return (
    input.eventExerciseIndex ===
      input.pendingExerciseChange.sourceExerciseIndex ||
    input.eventExerciseId === input.pendingExerciseChange.sourceExerciseId
  )
}
