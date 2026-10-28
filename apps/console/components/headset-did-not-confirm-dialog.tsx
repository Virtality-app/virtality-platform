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
import {
  headsetDidNotConfirmCopy,
  type HeadsetDidNotConfirmIntent,
  type HeadsetDidNotConfirmReason,
} from '@/lib/headset-did-not-confirm'

export function HeadsetDidNotConfirmDialog({
  reason,
  intent = 'download',
  onOpenChange,
}: {
  reason: HeadsetDidNotConfirmReason | null
  intent?: HeadsetDidNotConfirmIntent
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useClientT(['patient-dashboard', 'common'])
  return (
    <Dialog open={reason != null} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t('headsetDialog.didNotConfirmTitle')}</DialogTitle>
          <DialogDescription>
            {reason ? headsetDidNotConfirmCopy(intent, reason) : null}
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
