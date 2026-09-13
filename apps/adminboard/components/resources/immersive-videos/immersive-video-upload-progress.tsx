'use client'

import { cn } from '@/lib/utils'

/** One progress line for an upload: a label above a bar at `percent`. */
export function ImmersiveVideoUploadProgress({
  label,
  percent,
}: {
  label: string
  percent: number
}) {
  return (
    <div className='space-y-1'>
      <p className='text-muted-foreground text-sm'>{label}</p>
      <div className='h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800'>
        <div
          className={cn('h-full bg-zinc-900 dark:bg-zinc-50')}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
