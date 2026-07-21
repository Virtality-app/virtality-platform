'use client'

import { Button } from '@/components/ui/button'
import { HighlightCardFormDialog } from '@/components/highlight-cards/highlight-card-form-dialog'
import type { HighlightCardDialogMode } from '@/components/highlight-cards/highlight-card-form-dialog'
import { HighlightCardList } from '@/components/highlight-cards/highlight-card-list'
import {
  canAddHighlightCard,
  HIGHLIGHT_CARD_COLLECTION_DESCRIPTIONS,
} from '@/lib/highlight-cards'
import type {
  HighlightCardCollection,
  HighlightCardListItem,
} from '@virtality/shared/types'
import { useHighlightCards } from '@virtality/react-query'
import { PlusSquare } from 'lucide-react'
import { useState, type ReactNode } from 'react'

type HighlightCardCollectionEditorProps = {
  collection: HighlightCardCollection
}

export function HighlightCardCollectionEditor({
  collection,
}: HighlightCardCollectionEditorProps) {
  const [dialogMode, setDialogMode] = useState<HighlightCardDialogMode>(null)
  const [editingCard, setEditingCard] = useState<HighlightCardListItem | null>(
    null,
  )
  const { data: cards = [], isPending } = useHighlightCards(collection)
  const canAdd = canAddHighlightCard(cards.length)

  const handleEdit = (card: HighlightCardListItem) => {
    setEditingCard(card)
    setDialogMode('edit')
  }

  const handleCloseDialog = () => {
    setDialogMode(null)
    setEditingCard(null)
  }

  const handleOpenCreate = () => {
    setEditingCard(null)
    setDialogMode('create')
  }

  let cardListContent: ReactNode
  if (isPending) {
    cardListContent = (
      <p className='text-muted-foreground text-sm'>
        Loading highlight cards...
      </p>
    )
  } else if (cards.length === 0) {
    cardListContent = (
      <p className='text-muted-foreground rounded-lg border border-dashed p-6 text-sm'>
        No cards yet. Empty collection hides the website grid.
      </p>
    )
  } else {
    cardListContent = (
      <HighlightCardList
        collection={collection}
        cards={cards}
        onEdit={handleEdit}
      />
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <p className='text-muted-foreground max-w-2xl text-sm'>
          {HIGHLIGHT_CARD_COLLECTION_DESCRIPTIONS[collection]}
        </p>
        <Button
          variant='primary'
          className='ml-auto flex items-center'
          disabled={!canAdd}
          onClick={handleOpenCreate}
        >
          <PlusSquare />
          Add card
        </Button>
      </div>

      {cardListContent}

      <HighlightCardFormDialog
        collection={collection}
        card={editingCard}
        mode={dialogMode}
        onClose={handleCloseDialog}
      />
    </div>
  )
}
