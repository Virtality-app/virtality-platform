import { cn } from '@/lib/utils'
import { formatMinutes } from '@/lib/dashboard-format'
import { SESSION_TYPE_LABELS, type SessionLogRow } from '@/lib/dashboard-types'
import { SESSION_TYPE_SWATCH } from '../session-type-style'

/** Bar length is relative to this many minutes; longer sessions fill it. */
const FULL_BAR_MINUTES = 60

type SessionDurationBarProps = {
  row: SessionLogRow
}

export function SessionDurationBar({ row }: SessionDurationBarProps) {
  if (row.totalMinutes === null) {
    return <span className='text-muted-foreground text-sm'>—</span>
  }

  const width = Math.min(100, (row.totalMinutes / FULL_BAR_MINUTES) * 100)

  return (
    <span className='flex items-center gap-3'>
      <span
        role='img'
        aria-label={`${formatMinutes(row.totalMinutes)} of ${SESSION_TYPE_LABELS[row.type]}`}
        className='bg-muted flex h-2 flex-1 overflow-hidden rounded-full'
      >
        <span
          className={cn('h-full', SESSION_TYPE_SWATCH[row.type])}
          style={{ width: `${width}%` }}
        />
      </span>
      <span className='w-16 text-right font-mono text-xs tabular-nums'>
        {formatMinutes(row.totalMinutes)}
      </span>
    </span>
  )
}
