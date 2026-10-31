import { getRepScoresByExercise } from '@/lib/session-metrics'

/** What the clinician sees at the top of the Session Completed dialog. */
export type SessionCompletionSummary = {
  /** Whole minutes from session start to completion (or now); null when unknown. */
  durationMinutes: number | null
  /** Exercises with at least one recorded rep. */
  exercisesWithProgress: number
  /** Exercises in the session's working copy. */
  exercisesPlanned: number
  /** Completed rep measurements across every set and exercise. */
  repsRecorded: number
}

type SummarySource = {
  createdAt?: Date | string | null
  completedAt?: Date | string | null
  sessionExercise?: { id: string }[] | null
  sessionData?: { sessionExerciseId: string | null; value: string }[] | null
}

function durationMinutes(
  createdAt: SummarySource['createdAt'],
  end: Date,
): number | null {
  if (!createdAt) return null
  const start = new Date(createdAt).getTime()
  if (!Number.isFinite(start)) return null
  return Math.max(0, Math.floor((end.getTime() - start) / 60_000))
}

export function buildSessionCompletionSummary(
  session: SummarySource | null | undefined,
  now: Date = new Date(),
): SessionCompletionSummary | null {
  if (!session) return null

  const end = session.completedAt ? new Date(session.completedAt) : now
  const exercisesWithData = new Set<string>()
  let repsRecorded = 0

  for (const row of session.sessionData ?? []) {
    const reps = getRepScoresByExercise(row.value).length
    if (reps === 0) continue
    repsRecorded += reps
    if (row.sessionExerciseId) exercisesWithData.add(row.sessionExerciseId)
  }

  return {
    durationMinutes: durationMinutes(session.createdAt, end),
    exercisesWithProgress: exercisesWithData.size,
    exercisesPlanned: session.sessionExercise?.length ?? 0,
    repsRecorded,
  }
}
