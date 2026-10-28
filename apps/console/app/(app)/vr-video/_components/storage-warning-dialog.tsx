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

export function StorageWarningDialog({
  open,
  description,
  onCancel,
  onConfirm,
}: {
  open: boolean
  description: string
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
          <DialogTitle>{t('storageDialog.title')}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={onCancel}>
            {t('btn.cancel', { ns: 'common' })}
          </Button>
          <Button variant='primary' onClick={onConfirm}>
            {t('storageDialog.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function needsStorageWarning(
  sizeBytes: number,
  freeBytes: number | null,
): boolean {
  return freeBytes != null && sizeBytes > freeBytes
}
