'use client'

import { formatImmersiveVideoUploadProgress } from '@/lib/immersive-video-admin-row'
import { cn } from '@/lib/utils'

export function ImmersiveVideoUploadProgress({
  uploadedBytes,
  totalBytes,
}: {
  uploadedBytes: number
  totalBytes: number
}) {
  const percent =
    totalBytes === 0 ? 0 : Math.round((uploadedBytes / totalBytes) * 100)
  return (
    <div className='space-y-1'>
      <p className='text-muted-foreground text-sm'>
        {formatImmersiveVideoUploadProgress(uploadedBytes, totalBytes)}
      </p>
      <div className='h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800'>
        <div
          className={cn('h-full bg-zinc-900 dark:bg-zinc-50')}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
