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
  return (
    <Dialog open={reason != null} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Headset didn&apos;t confirm</DialogTitle>
          <DialogDescription>
            {reason ? headsetDidNotConfirmCopy(intent, reason) : null}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='primary' onClick={() => onOpenChange(false)}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
