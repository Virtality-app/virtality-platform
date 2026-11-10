import { getSessionDurationMinutes } from './session-therapy-intensity.ts'

export const SESSION_TYPES = ['exercise', 'vr'] as const

/**
 * What ran in one patient session: an exercise program or an Immersive Video.
 * The console never runs both at once, so a session is one or the other.
 * Immersive Video playback is not recorded yet, so every session reads as
 * `exercise` until a session carries `videoMinutes`.
 */
export type SessionType = (typeof SESSION_TYPES)[number]

export type SessionTypeCounts = Record<SessionType, number>

export type SessionTimingInput = {
  createdAt: string
  completedAt: string | null
  /**
   * Set when the clinician pressed Don't Save. The session still counts, and
   * the deletion time stands in as its end when it has no end time of its own.
   */
  deletedAt: string | null
  /** Minutes of Immersive Video in the session; `null` when none ran. */
  videoMinutes: number | null
}

export type SessionTiming = {
  type: SessionType
  totalMinutes: number | null
}

export const emptyTypeCounts = (): SessionTypeCounts => ({
  exercise: 0,
  vr: 0,
})

export const mapTypeCounts = <T>(
  map: (type: SessionType) => T,
): Record<SessionType, T> => ({
  exercise: map('exercise'),
  vr: map('vr'),
})

export function classifySession(
  session: Pick<SessionTimingInput, 'videoMinutes'>,
): SessionType {
  return session.videoMinutes === null ? 'exercise' : 'vr'
}

/** When the session ended: its end time, else when it was not saved. */
export const getSessionEnd = (
  session: Pick<SessionTimingInput, 'completedAt' | 'deletedAt'>,
): string | null => session.completedAt ?? session.deletedAt

export function getSessionTiming(session: SessionTimingInput): SessionTiming {
  const end = getSessionEnd(session)
  return {
    type: classifySession(session),
    totalMinutes: end
      ? getSessionDurationMinutes(session.createdAt, end)
      : null,
  }
}
