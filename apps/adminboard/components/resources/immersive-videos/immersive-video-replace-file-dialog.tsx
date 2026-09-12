'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ImmersiveVideoFilePicker } from '@/components/resources/immersive-videos/immersive-video-file-picker'
import type { ImmersiveVideoPickedFile } from '@/components/resources/immersive-videos/immersive-video-file-picker'

export function ImmersiveVideoReplaceFileDialog({
  open,
  onOpenChange,
  version,
  disabled,
  disabledReason,
  onFile,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  version: number
  disabled?: boolean
  disabledReason?: string
  onFile: (picked: ImmersiveVideoPickedFile) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Replace file</DialogTitle>
          <DialogDescription>
            Headsets that already have version {version} keep playing it.
            They'll see an update available for version {version + 1} once this
            upload finishes.
          </DialogDescription>
        </DialogHeader>
        {disabled ? (
          <p className='text-sm'>{disabledReason}</p>
        ) : (
          <ImmersiveVideoFilePicker
            onPicked={(picked) => {
              onFile(picked)
              onOpenChange(false)
            }}
          />
        )}
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
