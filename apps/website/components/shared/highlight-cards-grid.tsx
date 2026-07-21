import type { HighlightCardListItem } from '@virtality/shared/types'
import HighlightCard from './highlight-card'

type HighlightCardsGridProps = {
  cards: HighlightCardListItem[]
}

const HighlightCardsGrid = ({ cards }: HighlightCardsGridProps) => {
  return (
    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto'>
      {cards.map((card, index) => (
        <HighlightCard
          key={card.id}
          title={card.title}
          body={card.body}
          iconName={card.iconName}
          index={index}
        />
      ))}
    </div>
  )
}

export default HighlightCardsGrid
