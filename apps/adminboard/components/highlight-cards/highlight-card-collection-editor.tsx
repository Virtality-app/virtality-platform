'use client'

import { Button } from '@/components/ui/button'
import { HighlightCardFormDialog } from '@/components/highlight-cards/highlight-card-form-dialog'
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
import { useState } from 'react'

type HighlightCardCollectionEditorProps = {
  collection: HighlightCardCollection
}

type DialogMode = 'create' | 'edit' | null

export function HighlightCardCollectionEditor({
  collection,
}: HighlightCardCollectionEditorProps) {
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
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
          onClick={() => {
            setEditingCard(null)
            setDialogMode('create')
          }}
        >
          <PlusSquare />
          Add card
        </Button>
      </div>

      {isPending ? (
        <p className='text-muted-foreground text-sm'>
          Loading highlight cards...
        </p>
      ) : cards.length === 0 ? (
        <p className='text-muted-foreground rounded-lg border border-dashed p-6 text-sm'>
          No cards yet. Empty collection hides the website grid.
        </p>
      ) : (
        <HighlightCardList
          collection={collection}
          cards={cards}
          onEdit={handleEdit}
        />
      )}

      <HighlightCardFormDialog
        collection={collection}
        card={editingCard}
        mode={dialogMode}
        onClose={handleCloseDialog}
      />
    </div>
  )
}
