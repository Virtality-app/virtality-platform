import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type CastingPlaceholderProps = {
  icon: ReactNode
  title: string
  description: string
  variant?: 'muted' | 'error'
}

export function CastingPlaceholder({
  icon,
  title,
  description,
  variant = 'muted',
}: CastingPlaceholderProps) {
  return (
    <div
      className={cn(
        'flex size-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed',
        variant === 'muted' && 'bg-muted/40 text-muted-foreground',
        variant === 'error' && 'bg-destructive/5 text-destructive',
      )}
    >
      {icon}
      <p className='text-sm font-medium'>{title}</p>
      <p
        className={cn(
          'text-xs',
          variant === 'error' && 'text-muted-foreground',
        )}
      >
        {description}
      </p>
    </div>
  )
}
