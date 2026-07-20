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
import { Spinner } from '@virtality/ui/components/spinner'
import { getErrorMessage } from '@/lib/get-error-message'
import type { PromoVideoItem } from '@virtality/shared/types'
import { useClearPromoVideo } from '@virtality/react-query'
import { useEffect, useState } from 'react'

type ClearPromoVideoDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  promoVideo: PromoVideoItem | null
}

export function ClearPromoVideoDialog({
  open,
  onOpenChange,
  promoVideo,
}: ClearPromoVideoDialogProps) {
  const [validationError, setValidationError] = useState<string | null>(null)
  const {
    mutateAsync: clearPromoVideo,
    isPending,
    reset,
  } = useClearPromoVideo()

  useEffect(() => {
    if (!open) {
      return
    }

    setValidationError(null)
    reset()
  }, [open, promoVideo, reset])

  const handleClear = async () => {
    if (!promoVideo) {
      return
    }

    setValidationError(null)

    try {
      await clearPromoVideo()
      onOpenChange(false)
    } catch (error) {
      setValidationError(getErrorMessage(error, 'Clear failed.'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Clear promo video</DialogTitle>
          <DialogDescription>
            This removes the landing-page promo video assignment. The section
            will hide until another MP4 is assigned. The Bucket Object stays in
            storage.
          </DialogDescription>
        </DialogHeader>

        {promoVideo ? (
          <div className='flex flex-col gap-2'>
            <p className='font-mono text-xs text-zinc-500'>
              {promoVideo.objectKey}
            </p>
            {validationError ? (
              <p className='text-sm text-red-500'>{validationError}</p>
            ) : null}
          </div>
        ) : null}

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type='button'
            variant='destructive'
            onClick={handleClear}
            disabled={!promoVideo || isPending}
          >
            {isPending ? <Spinner /> : 'Clear assignment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
