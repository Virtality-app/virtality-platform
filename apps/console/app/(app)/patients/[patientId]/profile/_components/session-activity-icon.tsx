import { Bike, Footprints } from 'lucide-react'
import type { ImmersiveVideoActivity } from '@/lib/session-metrics'
import { cn } from '@/lib/utils'

/** Cycling or walking, for an Immersive Session's video. */
const SessionActivityIcon = ({
  activity,
  className,
}: {
  activity: ImmersiveVideoActivity
  className?: string
}) => {
  const Icon = activity === 'WALKING' ? Footprints : Bike
  return (
    <Icon
      aria-hidden
      className={cn(
        'size-4 shrink-0 text-zinc-500 dark:text-zinc-400',
        className,
      )}
    />
  )
}

export default SessionActivityIcon
