'use client'

import { Button } from '@virtality/ui/components/button'
import { Badge } from '@virtality/ui/components/badge'
import { pausedProgressLabel } from '@/lib/headset-library-format'
import { LibraryCellCancelButton } from './library-cell-cancel-button'

export function LibraryCellPaused({
  bytesDownloaded,
  sizeBytes,
  disabled,
  onResume,
  onCancel,
}: {
  bytesDownloaded: number
  sizeBytes: number
  disabled: boolean
  onResume: () => void
  onCancel: () => void
}) {
  return (
    <div className='flex flex-wrap items-center justify-end gap-2'>
      <Badge variant='secondary'>
        {pausedProgressLabel(bytesDownloaded, sizeBytes)}
      </Badge>
      <Button type='button' size='sm' disabled={disabled} onClick={onResume}>
        Resume
      </Button>
      <LibraryCellCancelButton disabled={disabled} onCancel={onCancel} />
    </div>
  )
}
