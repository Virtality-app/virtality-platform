import type { useSessionActivity, useSessionLog } from '@virtality/react-query'

export type SessionActivityReport = NonNullable<
  ReturnType<typeof useSessionActivity>['data']
>
export type SessionActivityTrendPoint = SessionActivityReport['trend'][number]
export type ClinicianActivity = SessionActivityReport['clinicians'][number]
export type PatientActivity = SessionActivityReport['patients'][number]

export type SessionLogData = NonNullable<
  ReturnType<typeof useSessionLog>['data']
>
export type SessionLogRow = SessionLogData['rows'][number]

export type SessionType = SessionLogRow['type']
export type SessionTypeCounts = Record<SessionType, number>

/** Builds one value per session type. */
export const mapSessionTypes = <T>(
  map: (type: SessionType) => T,
): Record<SessionType, T> =>
  Object.fromEntries(SESSION_TYPES.map((type) => [type, map(type)])) as Record<
    SessionType,
    T
  >

export const SESSION_TYPES: readonly SessionType[] = ['exercise', 'vr']

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  exercise: 'Exercise',
  vr: 'VR video',
}

export type DashboardGranularity = 'day' | 'week'

/** Saved sessions, ones closed with Don't Save, or both. */
export type SessionSavedFilter = 'all' | 'saved' | 'notSaved'
