import { useCallback, useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type { SessionSavedFilter, SessionType } from '@/lib/dashboard-types'

export const SESSION_LOG_PAGE_SIZE = 25

export type SessionTypeFilter = SessionType | 'all'

/** Type, saved, clinician, search and page for the session log; filters reset the page. */
export function useSessionLogFilters() {
  const [type, setTypeState] = useState<SessionTypeFilter>('all')
  const [ownerUserId, setOwnerState] = useState('all')
  const [saved, setSavedState] = useState<SessionSavedFilter>('all')
  const [search, setSearchState] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search, 300)

  const setType = useCallback((next: SessionTypeFilter) => {
    setTypeState(next)
    setPage(1)
  }, [])

  const setSaved = useCallback((next: SessionSavedFilter) => {
    setSavedState(next)
    setPage(1)
  }, [])

  const setOwnerUserId = useCallback((next: string) => {
    setOwnerState(next)
    setPage(1)
  }, [])

  const setSearch = useCallback((next: string) => {
    setSearchState(next)
    setPage(1)
  }, [])

  return {
    type,
    ownerUserId,
    saved,
    search,
    debouncedSearch,
    page,
    setType,
    setOwnerUserId,
    setSaved,
    setSearch,
    setPage,
  }
}
