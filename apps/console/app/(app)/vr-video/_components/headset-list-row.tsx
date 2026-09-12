'use client'

import { cn } from '@/lib/utils'
import { storageUsedRatio } from '@/lib/headset-library-format'
import { HeadsetStatusLine } from './headset-status-line'

export function HeadsetListRow({
  name,
  online,
  readyCount,
  totalCount,
  subtitle,
  usedBytes,
  freeBytes,
  selected,
  onSelect,
}: {
  name: string
  online: boolean
  readyCount: number
  totalCount: number
  subtitle: string
  usedBytes: number
  freeBytes: number
  selected: boolean
  onSelect: () => void
}) {
  const usedRatio = storageUsedRatio(usedBytes, freeBytes)

  return (
    <button
      type='button'
      onClick={onSelect}
      className={cn(
        'hover:bg-muted/60 w-full rounded-lg px-3 py-2 text-left',
        selected && 'bg-muted',
      )}
    >
      <div className='min-w-0'>
        <p className='truncate font-medium'>{name}</p>
        <p className='text-muted-foreground text-xs'>
          {readyCount} of {totalCount} videos
        </p>
        <HeadsetStatusLine
          online={online}
          subtitle={subtitle}
          className='text-xs'
        />
        <div className='bg-muted mt-1.5 h-1 overflow-hidden rounded-full'>
          <div
            className='bg-primary h-full'
            style={{ width: `${usedRatio * 100}%` }}
          />
        </div>
      </div>
    </button>
  )
}
