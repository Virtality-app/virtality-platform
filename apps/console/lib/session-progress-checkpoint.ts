import type { ProgressDataPoint } from '@/types/models'
import type { SessionExerciseRowInput } from './patient-dashboard-session-launch'
import { extractCompletedProgressPoints } from './session-exercise-skip'
import {
  buildCurrentExerciseProgressUpsert,
  type SessionProgressUpsertInput,
} from './session-progress-persistence'

export type SetCompletionCheckpointInput = {
  patientSessionId: string
  sessionExerciseRows: ReadonlyArray<SessionExerciseRowInput>
  currentExerciseIndex: number
  progressByExerciseId: Readonly<
    Record<string, ReadonlyArray<ProgressDataPoint> | undefined>
  >
  currentExerciseProgress: ReadonlyArray<ProgressDataPoint>
  completedSet: number
  lastCompletedRepIndex: number
  isLastExercise: boolean
}

export type SetCompletionCheckpointResult = {
  upsert: SessionProgressUpsertInput
  progressByExerciseId: Record<string, ReadonlyArray<ProgressDataPoint>>
  nextCurrentExerciseIndex: number
}

export type ExerciseSkipCheckpointInput = {
  patientSessionId: string
  sessionExerciseRows: ReadonlyArray<SessionExerciseRowInput>
  currentExerciseIndex: number
  progressByExerciseId: Readonly<
    Record<string, ReadonlyArray<ProgressDataPoint> | undefined>
  >
  currentExerciseProgress: ReadonlyArray<ProgressDataPoint>
}

export type ExerciseSkipCheckpointResult = {
  upsert: SessionProgressUpsertInput | null
  progressByExerciseId: Record<string, ReadonlyArray<ProgressDataPoint>>
  completedProgressPoints: ReadonlyArray<ProgressDataPoint>
}

export function isExerciseLastSet(input: {
  completedSet: number
  lastCompletedRepIndex: number
  prescribedSets: number
  prescribedReps: number
}): boolean {
  return (
    input.completedSet === input.prescribedSets &&
    input.lastCompletedRepIndex === input.prescribedReps - 1
  )
}

export function shouldResetLiveExerciseAfterSetCompletion(input: {
  currentExerciseIndex: number
  nextCurrentExerciseIndex: number
  exerciseCount: number
}): boolean {
  return (
    input.nextCurrentExerciseIndex !== input.currentExerciseIndex &&
    input.nextCurrentExerciseIndex < input.exerciseCount
  )
}

function compactProgressByExerciseId(
  progressByExerciseId: Readonly<
    Record<string, ReadonlyArray<ProgressDataPoint> | undefined>
  >,
): Record<string, ReadonlyArray<ProgressDataPoint>> {
  return Object.fromEntries(
    Object.entries(progressByExerciseId).filter(
      (entry): entry is [string, ReadonlyArray<ProgressDataPoint>] =>
        entry[1] !== undefined,
    ),
  )
}

export function mutableProgressByExerciseId(
  progressByExerciseId: Record<string, ReadonlyArray<ProgressDataPoint>>,
): Record<string, ProgressDataPoint[]> {
  return Object.fromEntries(
    Object.entries(progressByExerciseId).map(([exerciseId, points]) => [
      exerciseId,
      [...points],
    ]),
  )
}

export function buildSetCompletionCheckpoint(
  input: SetCompletionCheckpointInput,
): SetCompletionCheckpointResult {
  const sessionExercise = input.sessionExerciseRows[input.currentExerciseIndex]

  if (!sessionExercise) {
    throw new Error('Missing session exercise row for checkpoint')
  }

  const isLastSet = isExerciseLastSet({
    completedSet: input.completedSet,
    lastCompletedRepIndex: input.lastCompletedRepIndex,
    prescribedSets: sessionExercise.sets,
    prescribedReps: sessionExercise.reps,
  })

  let progressByExerciseId = compactProgressByExerciseId(
    input.progressByExerciseId,
  )
  let nextCurrentExerciseIndex = input.currentExerciseIndex

  if (isLastSet) {
    progressByExerciseId = {
      ...progressByExerciseId,
      [sessionExercise.exerciseId]: [...input.currentExerciseProgress],
    }

    if (input.isLastExercise) {
      nextCurrentExerciseIndex = 0
    }
  }

  return {
    upsert: buildCurrentExerciseProgressUpsert({
      patientSessionId: input.patientSessionId,
      sessionExercise,
      progressPoints: input.currentExerciseProgress,
    }),
    progressByExerciseId,
    nextCurrentExerciseIndex,
  }
}

export function buildExerciseSkipCheckpoint(
  input: ExerciseSkipCheckpointInput,
): ExerciseSkipCheckpointResult {
  const sessionExercise = input.sessionExerciseRows[input.currentExerciseIndex]

  if (!sessionExercise) {
    throw new Error('Missing session exercise row for skip checkpoint')
  }

  const completedProgressPoints = extractCompletedProgressPoints(
    input.currentExerciseProgress,
  )
  const progressByExerciseId = compactProgressByExerciseId(
    input.progressByExerciseId,
  )

  if (completedProgressPoints.length === 0) {
    return {
      upsert: null,
      progressByExerciseId,
      completedProgressPoints,
    }
  }

  return {
    upsert: buildCurrentExerciseProgressUpsert({
      patientSessionId: input.patientSessionId,
      sessionExercise,
      progressPoints: completedProgressPoints,
    }),
    progressByExerciseId: {
      ...progressByExerciseId,
      [sessionExercise.exerciseId]: completedProgressPoints,
    },
    completedProgressPoints,
  }
}
