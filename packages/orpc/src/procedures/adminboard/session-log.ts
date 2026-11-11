import { UNKNOWN_OWNER_ID, UNKNOWN_OWNER_LABEL } from './analytics-filters.ts'
import {
  emptyTypeCounts,
  getSessionEnd,
  getSessionTiming,
  type SessionType,
  type SessionTypeCounts,
} from './session-type.ts'

export type SessionLogSourceRow = {
  id: string
  createdAt: string
  completedAt: string | null
  /** Set when the clinician pressed Don't Save. */
  deletedAt: string | null
  patientId: string
  patientName: string
  userId: string | null
  programName: string | null
  exerciseCount: number
  nprs: string | null
  videoMinutes: number | null
}

export const SESSION_SAVED_FILTERS = ['all', 'saved', 'notSaved'] as const

export type SessionSavedFilter = (typeof SESSION_SAVED_FILTERS)[number]

export type SessionLogFilters = {
  type: SessionType | 'all'
  /** Owner id, `UNKNOWN_OWNER_ID` for patients with no owner, or all. */
  ownerUserId: string | 'all'
  /** Whether the clinician saved the session or pressed Don't Save. */
  saved: SessionSavedFilter
  search: string
  page: number
  pageSize: number
}

export type SessionLogRow = {
  id: string
  startedAt: string
  /** The session's end time, else when it was not saved. */
  endedAt: string | null
  /** The clinician pressed Don't Save. */
  notSaved: boolean
  patientId: string
  patientName: string
  userId: string
  userLabel: string
  type: SessionType
  programName: string | null
  exerciseCount: number
  totalMinutes: number | null
  nprs: string | null
}

export type SessionLog = {
  rows: SessionLogRow[]
  total: number
  page: number
  pageSize: number
  /** Matches per type for the current owner, search and saved filters. */
  countsByType: SessionTypeCounts
  /** Saved and not saved matches for the current owner and search. */
  savedCounts: { saved: number; notSaved: number }
}

export function buildSessionLog(
  source: SessionLogSourceRow[],
  userNamesById: Record<string, string | null | undefined>,
  filters: SessionLogFilters,
): SessionLog {
  const needle = filters.search.trim().toLocaleLowerCase()

  const rows: SessionLogRow[] = source.map((session) => {
    const timing = getSessionTiming(session)
    const userId = session.userId ?? UNKNOWN_OWNER_ID
    return {
      id: session.id,
      startedAt: session.createdAt,
      endedAt: getSessionEnd(session),
      notSaved: session.deletedAt !== null,
      patientId: session.patientId,
      patientName: session.patientName,
      userId,
      userLabel:
        (session.userId && userNamesById[session.userId]) ||
        UNKNOWN_OWNER_LABEL,
      type: timing.type,
      programName: session.programName,
      exerciseCount: session.exerciseCount,
      totalMinutes: timing.totalMinutes,
      nprs: session.nprs,
    }
  })

  const matching = rows.filter((row) => {
    if (filters.ownerUserId !== 'all' && row.userId !== filters.ownerUserId) {
      return false
    }
    if (!needle) return true
    return [row.patientName, row.userLabel, row.programName ?? ''].some(
      (value) => value.toLocaleLowerCase().includes(needle),
    )
  })

  const notSaved = matching.filter((row) => row.notSaved).length
  const savedCounts = { saved: matching.length - notSaved, notSaved }

  const bySaved =
    filters.saved === 'all'
      ? matching
      : matching.filter(
          (row) => row.notSaved === (filters.saved === 'notSaved'),
        )

  const countsByType = emptyTypeCounts()
  for (const row of bySaved) countsByType[row.type] += 1

  const filtered =
    filters.type === 'all'
      ? bySaved
      : bySaved.filter((row) => row.type === filters.type)

  filtered.sort((a, b) => b.startedAt.localeCompare(a.startedAt))

  const lastPage = Math.max(1, Math.ceil(filtered.length / filters.pageSize))
  const page = Math.min(Math.max(1, filters.page), lastPage)
  const start = (page - 1) * filters.pageSize

  return {
    rows: filtered.slice(start, start + filters.pageSize),
    total: filtered.length,
    page,
    pageSize: filters.pageSize,
    countsByType,
    savedCounts,
  }
}
