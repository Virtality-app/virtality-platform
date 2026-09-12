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

const REPLACEMENT_COPY =
  'Another tab is now controlling this headset. Close this tab, or continue in the active one.'

export function HeadsetReplacementDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Headset controlled in another tab</DialogTitle>
          <DialogDescription>{REPLACEMENT_COPY}</DialogDescription>
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
