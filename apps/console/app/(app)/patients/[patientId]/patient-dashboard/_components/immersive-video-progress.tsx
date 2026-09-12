'use client'

import { Card, CardContent } from '@virtality/ui/components/card'
import { useImmersiveVideoSession } from '@/context/immersive-video-session-context'
import { formatPlaybackClock } from '@/lib/immersive-video-status'
import { cn } from '@/lib/utils'

export function ImmersiveVideoProgress({ className }: { className?: string }) {
  const { playback } = useImmersiveVideoSession()
  const { elapsed, remaining, ratio } = formatPlaybackClock(
    playback.state.positionSec,
    playback.state.durationSec,
  )

  return (
    <Card className={cn('flex items-center', className)}>
      <CardContent className='flex w-full flex-col gap-3 p-6'>
        <div className='flex items-center justify-between text-sm'>
          <span>{elapsed}</span>
          <span>{remaining}</span>
        </div>
        <div
          role='progressbar'
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(ratio * 100)}
          className='bg-muted h-2 w-full overflow-hidden rounded-full'
        >
          <div
            className='bg-primary h-full rounded-full'
            style={{ width: `${Math.round(ratio * 100)}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
