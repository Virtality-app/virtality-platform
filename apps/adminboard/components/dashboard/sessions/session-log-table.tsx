import { cn } from '@/lib/utils'
import type { SessionLogData } from '@/lib/dashboard-types'
import { SessionLogPagination } from './session-log-pagination'
import { SessionLogRow } from './session-log-row'

const COLUMNS = [
  'Started',
  'Clinician',
  'Patient',
  'Type',
  'What ran',
  'Duration',
  'Pain (NPRS)',
]

type SessionLogTableProps = {
  log: SessionLogData
  isFetching: boolean
  onPageChange: (page: number) => void
}

export function SessionLogTable({
  log,
  isFetching,
  onPageChange,
}: SessionLogTableProps) {
  return (
    <div
      className={cn(
        'bg-card rounded-xl border transition-opacity',
        isFetching && 'opacity-60',
      )}
    >
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[960px] text-sm'>
          <thead>
            <tr className='bg-muted/50 text-muted-foreground border-b text-left text-xs uppercase'>
              {COLUMNS.map((column) => (
                <th key={column} scope='col' className='px-4 py-3 font-medium'>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {log.rows.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className='text-muted-foreground px-4 py-12 text-center'
                >
                  No sessions match these filters.
                </td>
              </tr>
            ) : (
              log.rows.map((row) => <SessionLogRow key={row.id} row={row} />)
            )}
          </tbody>
        </table>
      </div>
      <SessionLogPagination
        page={log.page}
        pageSize={log.pageSize}
        total={log.total}
        onPageChange={onPageChange}
      />
    </div>
  )
}
