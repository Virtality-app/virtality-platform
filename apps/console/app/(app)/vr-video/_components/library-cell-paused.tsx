'use client'

import { Button } from '@virtality/ui/components/button'
import { Badge } from '@virtality/ui/components/badge'
import { useClientT } from '@/i18n/use-client-t'
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
  const { t } = useClientT(['vr-video', 'common'])

  return (
    <div className='flex flex-wrap items-center justify-end gap-2'>
      <Badge variant='secondary'>
        {pausedProgressLabel(bytesDownloaded, sizeBytes, t)}
      </Badge>
      <Button type='button' size='sm' disabled={disabled} onClick={onResume}>
        {t('btn.resume', { ns: 'common' })}
      </Button>
      <LibraryCellCancelButton disabled={disabled} onCancel={onCancel} />
    </div>
  )
}
