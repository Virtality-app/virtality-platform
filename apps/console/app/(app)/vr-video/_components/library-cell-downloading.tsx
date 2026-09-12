'use client'

import { X } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'

export function LibraryCellDownloading({
  percent,
  stalled,
  disabled,
  onPause,
  onCancel,
}: {
  percent: number
  stalled: boolean
  disabled: boolean
  onPause: () => void
  onCancel: () => void
}) {
  return (
    <div className='flex items-center gap-2'>
      <div className='bg-muted h-1.5 w-24 overflow-hidden rounded-full'>
        <div className='bg-primary h-full' style={{ width: `${percent}%` }} />
      </div>
      <span className='text-muted-foreground text-xs whitespace-nowrap'>
        {percent} %{stalled ? ' · stalled' : ''}
      </span>
      <Button
        type='button'
        variant='ghost'
        size='icon-sm'
        disabled={disabled}
        aria-label='Cancel'
        onClick={onCancel}
      >
        <X />
      </Button>
      <Button
        type='button'
        variant='outline'
        size='sm'
        disabled={disabled}
        onClick={onPause}
      >
        Pause
      </Button>
    </div>
  )
}
