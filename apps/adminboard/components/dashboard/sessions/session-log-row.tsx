import { formatSessionDate, formatSessionTime } from '@/lib/dashboard-format'
import type { SessionLogRow as SessionLogRowData } from '@/lib/dashboard-types'
import { SessionTypeBadge } from '../session-type-badge'
import { NotSavedBadge } from './not-saved-badge'
import { SessionDurationBar } from './session-duration-bar'

const describeContent = (row: SessionLogRowData): string => {
  const exercises =
    row.exerciseCount > 0
      ? `${row.exerciseCount} exercise${row.exerciseCount === 1 ? '' : 's'}`
      : null
  return [row.programName ?? 'Unnamed program', exercises]
    .filter(Boolean)
    .join(' · ')
}

type SessionLogRowProps = {
  row: SessionLogRowData
}

export function SessionLogRow({ row }: SessionLogRowProps) {
  return (
    <tr className='border-b last:border-b-0'>
      <td className='px-4 py-3 align-middle whitespace-nowrap'>
        <div>{formatSessionDate(row.startedAt)}</div>
        <div className='text-muted-foreground text-xs'>
          {formatSessionTime(row.startedAt)}
        </div>
      </td>
      <td className='px-4 py-3'>{row.userLabel}</td>
      <td className='px-4 py-3'>{row.patientName}</td>
      <td className='px-4 py-3'>
        <div className='flex flex-wrap gap-1.5'>
          <SessionTypeBadge type={row.type} />
          {row.notSaved ? <NotSavedBadge /> : null}
        </div>
      </td>
      <td className='text-muted-foreground max-w-72 truncate px-4 py-3'>
        {describeContent(row)}
      </td>
      <td className='w-56 px-4 py-3'>
        <SessionDurationBar row={row} />
      </td>
      <td className='px-4 py-3 whitespace-nowrap'>{row.nprs ?? '—'}</td>
    </tr>
  )
}
