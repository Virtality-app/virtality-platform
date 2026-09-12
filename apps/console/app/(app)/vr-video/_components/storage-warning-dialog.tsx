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
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Not enough free space</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={onCancel}>
            Cancel
          </Button>
          <Button variant='primary' onClick={onConfirm}>
            Download anyway
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

export function storageWarningCopy(
  freeLabel: string,
  sizeLabel: string,
): string {
  return `This headset has ${freeLabel} free and the video is ${sizeLabel}. The download will fail unless space is freed.`
}
