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
import type { HeadsetDidNotConfirmReason } from '@/hooks/use-headset-library'

const COPY: Record<HeadsetDidNotConfirmReason, string> = {
  'didnt-respond': "Headset didn't respond. Check it's on and the app is open.",
  disconnected:
    "The headset disconnected before confirming the download. When it reconnects, check the list. If the video isn't downloading, click Download again.",
}

export function HeadsetDidNotConfirmDialog({
  reason,
  onOpenChange,
}: {
  reason: HeadsetDidNotConfirmReason | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={reason != null} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Headset didn&apos;t confirm</DialogTitle>
          <DialogDescription>{reason ? COPY[reason] : null}</DialogDescription>
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
