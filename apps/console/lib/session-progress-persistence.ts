import type { ProgressDataPoint } from '@/types/models'
import type { SessionExerciseRowInput } from './patient-dashboard-session-launch'
import { extractCompletedProgressPoints } from './session-exercise-skip'

export type SessionProgressUpsertInput = {
  patientSessionId: string
  sessionExerciseId: string
  value: string
}

export function serializeSessionProgressValue(
  progressPoints: ReadonlyArray<ProgressDataPoint>,
): string {
  return JSON.stringify(progressPoints)
}

export function buildCurrentExerciseProgressUpsert(input: {
  patientSessionId: string
  sessionExercise: SessionExerciseRowInput
  progressPoints: ReadonlyArray<ProgressDataPoint>
}): SessionProgressUpsertInput {
  return {
    patientSessionId: input.patientSessionId,
    sessionExerciseId: input.sessionExercise.id,
    value: serializeSessionProgressValue(input.progressPoints),
  }
}

export function resolveExerciseProgressForPersistence(input: {
  isCurrentExercise: boolean
  snapshotProgress?: ReadonlyArray<ProgressDataPoint>
  liveProgress?: ReadonlyArray<ProgressDataPoint>
}): ReadonlyArray<ProgressDataPoint> {
  const snapshotCompleted = extractCompletedProgressPoints(
    input.snapshotProgress ?? [],
  )

  if (!input.isCurrentExercise) {
    return snapshotCompleted
  }

  const liveCompleted = extractCompletedProgressPoints(input.liveProgress ?? [])
  const preferLiveProgress =
    liveCompleted.length > 0 && liveCompleted.length >= snapshotCompleted.length

  return preferLiveProgress ? liveCompleted : snapshotCompleted
}

export function buildSessionProgressUpserts(input: {
  patientSessionId: string
  sessionExerciseRows: ReadonlyArray<SessionExerciseRowInput>
  progressByExerciseId: Readonly<
    Record<string, ReadonlyArray<ProgressDataPoint> | undefined>
  >
  currentExerciseIndex: number
  currentExerciseProgress: ReadonlyArray<ProgressDataPoint>
}): SessionProgressUpsertInput[] {
  return input.sessionExerciseRows.map((sessionExercise, index) => {
    const progressPoints = resolveExerciseProgressForPersistence({
      isCurrentExercise: index === input.currentExerciseIndex,
      snapshotProgress: input.progressByExerciseId[sessionExercise.exerciseId],
      liveProgress: input.currentExerciseProgress,
    })

    return buildCurrentExerciseProgressUpsert({
      patientSessionId: input.patientSessionId,
      sessionExercise,
      progressPoints,
    })
  })
}
