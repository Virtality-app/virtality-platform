import { HighlightCardCollectionEditor } from '@/components/highlight-cards/highlight-card-collection-editor'
import { HIGHLIGHT_CARD_COLLECTION_LABELS } from '@/lib/highlight-cards'

export const dynamic = 'force-dynamic'

const BenefitsPage = () => {
  return (
    <div className='min-h-screen-with-header mx-auto max-w-7xl px-4 py-6'>
      <div className='mb-8'>
        <h1 className='text-4xl font-bold tracking-tight'>
          {HIGHLIGHT_CARD_COLLECTION_LABELS.benefits}
        </h1>
        <p className='text-muted-foreground mt-2'>
          Manage the highlight cards shown in the website Benefits section.
        </p>
      </div>
      <HighlightCardCollectionEditor collection='benefits' />
    </div>
  )
}

export default BenefitsPage
