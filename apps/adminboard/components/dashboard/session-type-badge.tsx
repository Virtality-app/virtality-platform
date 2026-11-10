import { cn } from '@/lib/utils'
import { SESSION_TYPE_LABELS, type SessionType } from '@/lib/dashboard-types'
import { SESSION_TYPE_SWATCH } from './session-type-style'

type SessionTypeBadgeProps = {
  type: SessionType
}

export function SessionTypeBadge({ type }: SessionTypeBadgeProps) {
  return (
    <span className='border-border inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap'>
      <span
        aria-hidden
        className={cn('size-2 rounded-full', SESSION_TYPE_SWATCH[type])}
      />
      {SESSION_TYPE_LABELS[type]}
    </span>
  )
}
