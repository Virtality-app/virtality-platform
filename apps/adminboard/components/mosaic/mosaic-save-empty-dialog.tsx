'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MOSAIC_EMPTY_SAVE_WARNING } from '@virtality/shared/types'
import { useEffect, useState } from 'react'

type MosaicSaveEmptyDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isSaving?: boolean
}

export function MosaicSaveEmptyDialog({
  open,
  onOpenChange,
  onConfirm,
  isSaving = false,
}: MosaicSaveEmptyDialogProps) {
  const [acknowledged, setAcknowledged] = useState(false)

  useEffect(() => {
    if (!open) {
      setAcknowledged(false)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hide the live mosaic?</DialogTitle>
          <DialogDescription>{MOSAIC_EMPTY_SAVE_WARNING}</DialogDescription>
        </DialogHeader>

        <label className='flex items-start gap-3 text-sm'>
          <Checkbox
            checked={acknowledged}
            onCheckedChange={(checked) => setAcknowledged(checked === true)}
            aria-label='Acknowledge hiding the live mosaic section'
          />
          <span>
            I understand saving an empty board hides the landing mosaic for all
            visitors.
          </span>
        </label>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type='button'
            variant='destructive'
            onClick={onConfirm}
            disabled={!acknowledged || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save empty board'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
