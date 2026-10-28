'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@virtality/ui/components/button'
import { useClientT } from '@/i18n/use-client-t'
import { SleepModePath } from './sleep-mode-path'

export function DownloadPrepDialog({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  const { t } = useClientT(['vr-video', 'common'])

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('prepDialog.title')}</DialogTitle>
          <DialogDescription>{t('prepDialog.description')}</DialogDescription>
        </DialogHeader>
        <ol className='list-decimal space-y-3 pl-5 text-sm'>
          <li>
            <p className='font-medium'>{t('prepDialog.chargingTitle')}</p>
            <p className='text-muted-foreground'>
              {t('prepDialog.chargingDescription')}
            </p>
          </li>
          <li>
            <p className='font-medium'>{t('prepDialog.sleepTitle')}</p>
            <SleepModePath />
          </li>
        </ol>
        <DialogFooter>
          <Button variant='outline' onClick={onCancel}>
            {t('btn.cancel', { ns: 'common' })}
          </Button>
          <Button variant='primary' onClick={onConfirm}>
            {t('prepDialog.start')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
