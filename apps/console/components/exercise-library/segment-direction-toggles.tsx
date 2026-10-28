import { cn } from '@/lib/utils'
import type { NearTermDirection } from '@virtality/shared/utils'
import { CompleteExercise } from '@/types/models'
import {
  isDeferredRemoval,
  type DeferredRemovalIdSet,
} from '@/lib/program-list-deferred-removal'
import {
  NEAR_TERM_SIDES,
  directionToggleAriaLabel,
  programMemberForDirection,
} from './exercise-library-list-segments'

interface SegmentDirectionTogglesProps {
  members: CompleteExercise[]
  deferredRemoval: DeferredRemovalIdSet
  onToggle: (side: NearTermDirection) => void
}

const SegmentDirectionToggles = ({
  members,
  deferredRemoval,
  onToggle,
}: SegmentDirectionTogglesProps) => {
  return (
    <div className='mt-0.5 flex flex-wrap gap-1'>
      {NEAR_TERM_SIDES.map((side) => {
        const member = programMemberForDirection(members, side)
        const inProgram = member != null
        const isEnabled =
          inProgram && !isDeferredRemoval(deferredRemoval, member.id)
        return (
          <button
            key={side}
            type='button'
            aria-pressed={isEnabled}
            aria-label={directionToggleAriaLabel(isEnabled, inProgram, side)}
            className={cn(
              'text-muted-foreground rounded-full border px-2 py-0.5 text-xs font-medium',
              isEnabled &&
                'text-foreground animate-pulse border-cyan-500/60 bg-cyan-500/20',
            )}
            onClick={() => onToggle(side)}
          >
            {side}
          </button>
        )
      })}
    </div>
  )
}

export default SegmentDirectionToggles
