import { cn } from '@/lib/utils'
import { typeSegmentWidths } from '@/lib/dashboard-chart-model'
import {
  SESSION_TYPES,
  SESSION_TYPE_LABELS,
  type SessionTypeCounts,
} from '@/lib/dashboard-types'
import { SESSION_TYPE_SWATCH } from './session-type-style'

type TypeSplitBarProps = {
  counts: SessionTypeCounts
  /** Shared maximum so rows compare; defaults to this row's own total. */
  scaleMax?: number
  /** Text for screen readers, such as "150 sessions". */
  label: string
  className?: string
}

export function TypeSplitBar({
  counts,
  scaleMax,
  label,
  className,
}: TypeSplitBarProps) {
  const widths = typeSegmentWidths(counts, scaleMax)
  const description = SESSION_TYPES.map(
    (type) => `${SESSION_TYPE_LABELS[type]} ${Math.round(counts[type])}`,
  ).join(', ')

  return (
    <div
      role='img'
      aria-label={`${label}: ${description}`}
      className={cn(
        'bg-muted flex h-2 w-full gap-0.5 overflow-hidden rounded-full',
        className,
      )}
    >
      {SESSION_TYPES.map((type) =>
        widths[type] > 0 ? (
          <span
            key={type}
            className={cn('h-full', SESSION_TYPE_SWATCH[type])}
            style={{ width: `${widths[type]}%` }}
          />
        ) : null,
      )}
    </div>
  )
}
