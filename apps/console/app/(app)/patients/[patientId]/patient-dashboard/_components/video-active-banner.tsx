'use client'

import { cn } from '@/lib/utils'

const VIDEO_ACTIVE_BANNER =
  'A video is playing on this headset. Switch to Immersive Video mode to control it.'

export function VideoActiveBanner({ className }: { className?: string }) {
  return (
    <div
      role='status'
      className={cn(
        'rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
        className,
      )}
    >
      {VIDEO_ACTIVE_BANNER}
    </div>
  )
}
