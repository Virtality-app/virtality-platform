'use client'

import { useSessionLog } from '@virtality/react-query'
import type { DashboardRange } from '@/lib/dashboard-range'
import type { ClinicianActivity } from '@/lib/dashboard-types'
import { DashboardQueryState } from '../dashboard-query-state'
import { SessionTypeLegend } from '../session-type-legend'
import { SessionLogFilters } from './session-log-filters'
import { SessionLogTable } from './session-log-table'
import {
  SESSION_LOG_PAGE_SIZE,
  useSessionLogFilters,
} from './use-session-log-filters'

type SessionsTabProps = {
  range: DashboardRange
  allTime: boolean
  clinicians: ClinicianActivity[]
}

export function SessionsTab({ range, allTime, clinicians }: SessionsTabProps) {
  const filters = useSessionLogFilters()
  const log = useSessionLog({
    ...range,
    allTime,
    type: filters.type,
    ownerUserId: filters.ownerUserId,
    saved: filters.saved,
    search: filters.debouncedSearch,
    page: filters.page,
    pageSize: SESSION_LOG_PAGE_SIZE,
  })

  return (
    <div className='flex flex-col gap-4'>
      <SessionLogFilters
        search={filters.search}
        type={filters.type}
        ownerUserId={filters.ownerUserId}
        saved={filters.saved}
        countsByType={log.data?.countsByType}
        savedCounts={log.data?.savedCounts}
        clinicians={clinicians}
        onSearchChange={filters.setSearch}
        onTypeChange={filters.setType}
        onOwnerChange={filters.setOwnerUserId}
        onSavedChange={filters.setSaved}
      />
      <div className='flex flex-wrap items-center justify-between gap-3 px-1'>
        <p className='text-muted-foreground text-sm'>
          Every session started in this period, including ones closed with Don’t
          Save. Duration runs from start to end; a Don’t Save session ends when
          it was discarded.
        </p>
        <SessionTypeLegend />
      </div>
      <DashboardQueryState {...log}>
        {(data) => (
          <SessionLogTable
            log={data}
            isFetching={log.isFetching}
            onPageChange={filters.setPage}
          />
        )}
      </DashboardQueryState>
    </div>
  )
}
