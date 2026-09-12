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
import { IMMERSIVE_VIDEO_FILE_HINT } from '@/lib/immersive-video-admin-row'
import { Input } from '@virtality/ui/components/input'

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
  onFile: (file: File) => void
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
        <p className='text-muted-foreground text-sm'>
          {IMMERSIVE_VIDEO_FILE_HINT}
        </p>
        {disabled ? (
          <p className='text-sm'>{disabledReason}</p>
        ) : (
          <Input
            type='file'
            accept='video/*,.mp4,.m4v,.mov,.webm,.mkv'
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) return
              onFile(file)
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
