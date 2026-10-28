'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useClientT } from '@/i18n/use-client-t'
import { Button } from '@virtality/ui/components/button'

export function HeadsetReplacementDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useClientT(['patient-dashboard', 'common'])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t('headsetDialog.replacedTitle')}</DialogTitle>
          <DialogDescription>
            {t('headsetDialog.replacedDescription')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='primary' onClick={() => onOpenChange(false)}>
            {t('common:btn.ok')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
