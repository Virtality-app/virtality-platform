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
import { LucideIconPicker } from '@/components/highlight-cards/lucide-icon-picker'
import { DEFAULT_HIGHLIGHT_CARD_ICON_NAME } from '@/lib/highlight-cards'
import { getErrorMessage } from '@/lib/get-error-message'
import { resolveLucideIconComponent } from '@/lib/lucide-icons'
import { Input } from '@virtality/ui/components/input'
import { Label } from '@virtality/ui/components/label'
import { Textarea } from '@virtality/ui/components/textarea'
import {
  HIGHLIGHT_CARD_BODY_MAX_LENGTH,
  HIGHLIGHT_CARD_TITLE_MAX_LENGTH,
  type HighlightCardCollection,
  type HighlightCardListItem,
} from '@virtality/shared/types'
import {
  useCreateHighlightCard,
  useUpdateHighlightCard,
} from '@virtality/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export type HighlightCardDialogMode = 'create' | 'edit' | null

type HighlightCardFormDialogProps = {
  collection: HighlightCardCollection
  card: HighlightCardListItem | null
  mode: HighlightCardDialogMode
  onClose: () => void
}

export function HighlightCardFormDialog({
  collection,
  card,
  mode,
  onClose,
}: HighlightCardFormDialogProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [iconName, setIconName] = useState(DEFAULT_HIGHLIGHT_CARD_ICON_NAME)
  const { mutate: createHighlightCard, isPending: isCreating } =
    useCreateHighlightCard()
  const { mutate: updateHighlightCard, isPending: isUpdating } =
    useUpdateHighlightCard()

  const isPending = isCreating || isUpdating
  const open = mode !== null

  useEffect(() => {
    if (!open) {
      return
    }

    if (mode === 'edit' && card) {
      setTitle(card.title)
      setBody(card.body)
      setIconName(card.iconName)
      return
    }

    setTitle('')
    setBody('')
    setIconName(DEFAULT_HIGHLIGHT_CARD_ICON_NAME)
  }, [card, mode, open])

  const validateForm = () => {
    const trimmedTitle = title.trim()
    const trimmedBody = body.trim()
    const trimmedIconName = iconName.trim()

    if (!trimmedTitle) {
      toast.error('Title is required.')
      return null
    }

    if (!trimmedBody) {
      toast.error('Body is required.')
      return null
    }

    if (!resolveLucideIconComponent(trimmedIconName)) {
      toast.error('Select a valid Lucide icon.')
      return null
    }

    return {
      title: trimmedTitle,
      body: trimmedBody,
      iconName: trimmedIconName,
    }
  }

  const handleSave = () => {
    const values = validateForm()
    if (!values) {
      return
    }

    if (mode === 'create') {
      createHighlightCard(
        {
          collection,
          ...values,
        },
        {
          onSuccess: () => {
            toast.success('Highlight card added.')
            onClose()
          },
          onError: (error: unknown) => {
            toast.error(getErrorMessage(error, 'Failed to add highlight card.'))
          },
        },
      )
      return
    }

    if (!card) {
      return
    }

    updateHighlightCard(
      {
        id: card.id,
        ...values,
      },
      {
        onSuccess: () => {
          toast.success('Highlight card updated.')
          onClose()
        },
        onError: (error: unknown) => {
          toast.error(
            getErrorMessage(error, 'Failed to update highlight card.'),
          )
        },
      },
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
        }
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add highlight card' : 'Edit highlight card'}
          </DialogTitle>
          <DialogDescription>
            Title max {HIGHLIGHT_CARD_TITLE_MAX_LENGTH}, body max{' '}
            {HIGHLIGHT_CARD_BODY_MAX_LENGTH}. Changes go live immediately.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          <div className='space-y-2'>
            <Label htmlFor='highlight-card-title'>Title</Label>
            <Input
              id='highlight-card-title'
              value={title}
              maxLength={HIGHLIGHT_CARD_TITLE_MAX_LENGTH}
              disabled={isPending}
              onChange={(event) => setTitle(event.target.value)}
              placeholder='Card title'
            />
            <p className='text-muted-foreground text-xs'>
              {title.length}/{HIGHLIGHT_CARD_TITLE_MAX_LENGTH}
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='highlight-card-body'>Body</Label>
            <Textarea
              id='highlight-card-body'
              value={body}
              maxLength={HIGHLIGHT_CARD_BODY_MAX_LENGTH}
              rows={4}
              disabled={isPending}
              onChange={(event) => setBody(event.target.value)}
              placeholder='Card body copy'
            />
            <p className='text-muted-foreground text-xs'>
              {body.length}/{HIGHLIGHT_CARD_BODY_MAX_LENGTH}
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='highlight-card-icon'>Icon</Label>
            <LucideIconPicker
              id='highlight-card-icon'
              value={iconName}
              disabled={isPending}
              onChange={setIconName}
            />
          </div>
        </div>

        <DialogFooter className='gap-2 sm:justify-end'>
          <Button
            type='button'
            variant='outline'
            disabled={isPending}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type='button'
            variant='primary'
            disabled={isPending}
            onClick={handleSave}
          >
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
