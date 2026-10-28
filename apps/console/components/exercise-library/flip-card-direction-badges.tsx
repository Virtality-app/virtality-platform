import { MouseEvent } from 'react'
import { Button } from '@virtality/ui/components/button'
import { cn } from '@/lib/utils'
import type {
  DirectionBadgeHighlight,
  NearTermDirection,
} from '@virtality/shared/utils'

interface FlipCardDirectionBadgesProps {
  badges: DirectionBadgeHighlight[]
  onBadgeClick?: (side: NearTermDirection, e: MouseEvent) => void
}

const FlipCardDirectionBadges = ({
  badges,
  onBadgeClick,
}: FlipCardDirectionBadgesProps) => {
  return (
    <div className='flex flex-wrap justify-center gap-1'>
      {badges.map((b) => {
        const badgeClass = cn(
          'text-muted-foreground rounded-full border px-2 py-0.5 text-xs font-medium',
          b.selected &&
            'text-foreground border-cyan-500/60 dark:border-cyan-500/60 bg-cyan-500/20 dark:bg-cyan-500/20',
          b.emphasized &&
            'text-foreground ring-cyan-highlight bg-cyan-500/15 dark:bg-cyan-500/15 ring-2',
        )
        if (onBadgeClick) {
          return (
            <Button
              key={b.side}
              variant='outline'
              type='button'
              aria-pressed={Boolean(b.selected)}
              aria-label={`${b.selected ? 'Remove' : 'Add'} ${b.side} variant`}
              className={cn(
                badgeClass,
                'px-4 hover:bg-cyan-500/25 dark:hover:bg-cyan-500/25',
              )}
              onClick={(e) => {
                e.stopPropagation()
                onBadgeClick(b.side, e)
              }}
            >
              {b.side}
            </Button>
          )
        }
        return (
          <span key={b.side} className={badgeClass}>
            {b.side}
          </span>
        )
      })}
    </div>
  )
}

export default FlipCardDirectionBadges
