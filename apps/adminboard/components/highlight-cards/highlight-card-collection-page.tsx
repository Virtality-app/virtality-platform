import { HighlightCardCollectionEditor } from '@/components/highlight-cards/highlight-card-collection-editor'
import {
  HIGHLIGHT_CARD_COLLECTION_LABELS,
  HIGHLIGHT_CARD_PAGE_DESCRIPTIONS,
} from '@/lib/highlight-cards'
import type { HighlightCardCollection } from '@virtality/shared/types'

type HighlightCardCollectionPageProps = {
  collection: HighlightCardCollection
}

export function HighlightCardCollectionPage({
  collection,
}: HighlightCardCollectionPageProps) {
  return (
    <div className='min-h-screen-with-header mx-auto max-w-7xl px-4 py-6'>
      <div className='mb-8'>
        <h1 className='text-4xl font-bold tracking-tight'>
          {HIGHLIGHT_CARD_COLLECTION_LABELS[collection]}
        </h1>
        <p className='text-muted-foreground mt-2'>
          {HIGHLIGHT_CARD_PAGE_DESCRIPTIONS[collection]}
        </p>
      </div>
      <HighlightCardCollectionEditor collection={collection} />
    </div>
  )
}
