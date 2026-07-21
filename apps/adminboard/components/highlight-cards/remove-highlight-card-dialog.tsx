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
import type {
  HighlightCardCollection,
  HighlightCardListItem,
} from '@virtality/shared/types'
import { useRemoveHighlightCard } from '@virtality/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type RemoveHighlightCardDialogProps = {
  collection: HighlightCardCollection
  open: boolean
  onOpenChange: (open: boolean) => void
  card: HighlightCardListItem | null
}

export function RemoveHighlightCardDialog({
  collection,
  open,
  onOpenChange,
  card,
}: RemoveHighlightCardDialogProps) {
  const {
    mutateAsync: removeHighlightCard,
    isPending,
    reset,
  } = useRemoveHighlightCard(collection)
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    setValidationError(null)
    reset()
  }, [card, open, reset])

  const handleRemove = async () => {
    if (!card) {
      return
    }

    setValidationError(null)

    try {
      await removeHighlightCard({ id: card.id })
      toast.success('Highlight card removed.')
      onOpenChange(false)
    } catch (error) {
      setValidationError(getErrorMessage(error, 'Remove failed.'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Remove highlight card</DialogTitle>
          <DialogDescription>
            Remove this card from the website. Changes go live immediately.
          </DialogDescription>
        </DialogHeader>

        {card ? (
          <div className='flex flex-col gap-2'>
            <p className='text-sm font-medium'>
              {card.title.trim() || 'Untitled card'}
            </p>
            <p className='text-muted-foreground line-clamp-2 text-sm'>
              {card.body.trim() || 'No body'}
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
            onClick={handleRemove}
            disabled={!card || isPending}
          >
            {isPending ? <Spinner /> : 'Remove card'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
