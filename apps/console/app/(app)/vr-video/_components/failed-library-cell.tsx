'use client'

import { Button } from '@virtality/ui/components/button'
import { videoDownloadFailureCopy } from '@/lib/video-download-failure-copy'
import type { VideoDownloadFailureReason } from '@virtality/shared/types'

export function FailedLibraryCell({
  reason,
  disabled,
  onDownload,
}: {
  reason: VideoDownloadFailureReason
  disabled: boolean
  onDownload?: () => void
}) {
  const failure = videoDownloadFailureCopy(reason)
  const retry =
    reason === 'network' ||
    reason === 'checksum_mismatch' ||
    reason === 'url_expired' ||
    reason === 'insufficient_storage'

  return (
    <div className='max-w-xs text-right'>
      {failure.copy ? (
        <p className='text-muted-foreground text-xs'>{failure.copy}</p>
      ) : null}
      {failure.action && onDownload ? (
        <Button
          type='button'
          size='sm'
          className='mt-1'
          disabled={disabled}
          onClick={onDownload}
        >
          {retry ? 'Try again' : 'Download'}
        </Button>
      ) : null}
    </div>
  )
}
