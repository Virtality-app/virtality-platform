import type { ExtendedPatientSession } from '@/types/models'
import {
  getClinicalHistorySessionDate,
  getSessionDisplayName,
  isImmersiveSession,
} from '@/lib/session-history'
import {
  getExerciseQualityScore,
  getPeakCapability,
  getSessionDurationMinutes,
  type ImmersiveVideoActivity,
} from '@/lib/session-metrics'

/**
 * Row model for the patient sessions table: one session plus the numbers the
 * list shows. An Immersive Session has no exercise numbers (`null`), so its
 * row shows "—" there and never moves the progress delta.
 */
export type SessionListRowModel = {
  id: string
  session: ExtendedPatientSession
  date: Date | null
  /** The program name, or the video title for an Immersive Session. */
  programName: string
  /** The video's activity on an Immersive Session; `null` otherwise. */
  activity: ImmersiveVideoActivity | null
  durationMin: number | null
  exercisesDone: number | null
  exercisesPlanned: number | null
  avgProgressPct: number | null
  /** Change in average progress vs the previous session that recorded reps; null for the first. */
  progressDeltaPct: number | null
  bestRepPct: number | null
  hasNotes: boolean
}

function buildRowWithoutDelta(
  session: ExtendedPatientSession,
): Omit<SessionListRowModel, 'progressDeltaPct'> {
  if (isImmersiveSession(session)) {
    return {
      id: session.id,
      session,
      date: getClinicalHistorySessionDate(session),
      programName: getSessionDisplayName(session),
      activity: session.sessionImmersiveVideo?.activity ?? null,
      durationMin: getSessionDurationMinutes(session),
      exercisesDone: null,
      exercisesPlanned: null,
      avgProgressPct: null,
      bestRepPct: null,
      hasNotes: false,
    }
  }

  const quality = getExerciseQualityScore(session)
  const avgProgressPct = quality.length
    ? quality.reduce((sum, ex) => sum + ex.avgProgressPct, 0) / quality.length
    : null
  const { sessionBest } = getPeakCapability(session)

  return {
    id: session.id,
    session,
    date: getClinicalHistorySessionDate(session),
    programName: getSessionDisplayName(session),
    activity: null,
    durationMin: getSessionDurationMinutes(session),
    exercisesDone: quality.length,
    exercisesPlanned: session.sessionExercise?.length ?? 0,
    avgProgressPct,
    bestRepPct: quality.length ? sessionBest : null,
    hasNotes: Boolean(session.notes?.trim()),
  }
}

/**
 * Builds table rows in chronological order. The progress delta compares each
 * session to the previous one (by date) that recorded any reps, across the
 * whole list given, so pass the full history rather than a date-filtered slice.
 */
export function buildSessionListRows(
  sessions: ExtendedPatientSession[],
): SessionListRowModel[] {
  const ordered = sessions
    .map(buildRowWithoutDelta)
    .sort((a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0))

  let previousAvg: number | null = null
  return ordered.map((row) => {
    const progressDeltaPct =
      row.avgProgressPct != null && previousAvg != null
        ? row.avgProgressPct - previousAvg
        : null
    if (row.avgProgressPct != null) previousAvg = row.avgProgressPct
    return { ...row, progressDeltaPct }
  })
}
