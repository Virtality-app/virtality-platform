import { cn } from '@/lib/utils'
import { SESSION_TYPES, SESSION_TYPE_LABELS } from '@/lib/dashboard-types'
import { SESSION_TYPE_SWATCH } from './session-type-style'

type SessionTypeLegendProps = {
  className?: string
}

export function SessionTypeLegend({ className }: SessionTypeLegendProps) {
  return (
    <ul
      className={cn(
        'text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs',
        className,
      )}
    >
      {SESSION_TYPES.map((type) => (
        <li key={type} className='flex items-center gap-1.5'>
          <span
            aria-hidden
            className={cn('size-2.5 rounded-sm', SESSION_TYPE_SWATCH[type])}
          />
          {SESSION_TYPE_LABELS[type]}
        </li>
      ))}
    </ul>
  )
}
