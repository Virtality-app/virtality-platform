'use client'

import { Button } from '@/components/ui/button'
import { RemoveHighlightCardDialog } from '@/components/highlight-cards/remove-highlight-card-dialog'
import { LucideIconGlyph } from '@/components/highlight-cards/lucide-icon-picker'
import { getErrorMessage } from '@/lib/get-error-message'
import type {
  HighlightCardCollection,
  HighlightCardListItem,
} from '@virtality/shared/types'
import { useReorderHighlightCard } from '@virtality/react-query'
import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

type HighlightCardListProps = {
  collection: HighlightCardCollection
  cards: HighlightCardListItem[]
  onEdit: (card: HighlightCardListItem) => void
}

export function HighlightCardList({
  collection,
  cards,
  onEdit,
}: HighlightCardListProps) {
  const { mutate: reorderHighlightCard, isPending: isReordering } =
    useReorderHighlightCard()
  const [cardToRemove, setCardToRemove] =
    useState<HighlightCardListItem | null>(null)

  const handleReorder = (
    card: HighlightCardListItem,
    direction: 'up' | 'down',
  ) => {
    reorderHighlightCard(
      { id: card.id, direction },
      {
        onError: (error: unknown) => {
          toast.error(
            getErrorMessage(error, 'Failed to reorder highlight card.'),
          )
        },
      },
    )
  }

  return (
    <>
      <ul className='space-y-3'>
        {cards.map((card, index) => (
          <li
            key={card.id}
            className='flex items-center gap-4 rounded-lg border p-3'
          >
            <div className='bg-muted flex size-12 shrink-0 items-center justify-center rounded-lg'>
              <LucideIconGlyph name={card.iconName} className='size-6' />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='truncate font-medium'>
                {card.title.trim() || (
                  <span className='text-muted-foreground italic'>Untitled</span>
                )}
              </p>
              <p className='text-muted-foreground line-clamp-1 text-sm'>
                {card.body.trim() || 'No body'}
              </p>
            </div>
            <div className='flex shrink-0 items-center gap-1'>
              <Button
                type='button'
                variant='outline'
                size='icon'
                disabled={isReordering || index === 0}
                aria-label={`Move ${card.title || 'card'} up`}
                onClick={() => handleReorder(card, 'up')}
              >
                <ChevronUp className='size-4' />
              </Button>
              <Button
                type='button'
                variant='outline'
                size='icon'
                disabled={isReordering || index === cards.length - 1}
                aria-label={`Move ${card.title || 'card'} down`}
                onClick={() => handleReorder(card, 'down')}
              >
                <ChevronDown className='size-4' />
              </Button>
              <Button
                type='button'
                variant='outline'
                size='icon'
                disabled={isReordering}
                aria-label={`Edit ${card.title || 'card'}`}
                onClick={() => onEdit(card)}
              >
                <Pencil className='size-4' />
              </Button>
              <Button
                type='button'
                variant='outline'
                size='icon'
                aria-label={`Remove ${card.title || 'card'}`}
                onClick={() => setCardToRemove(card)}
              >
                <Trash2 className='size-4' />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <RemoveHighlightCardDialog
        collection={collection}
        open={cardToRemove !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCardToRemove(null)
          }
        }}
        card={cardToRemove}
      />
    </>
  )
}
