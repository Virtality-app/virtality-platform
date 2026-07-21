import {
  HIGHLIGHT_CARD_MAX_PER_COLLECTION,
  type HighlightCardCollection,
} from '@virtality/shared/types'

export const DEFAULT_HIGHLIGHT_CARD_ICON_NAME = 'Activity'

export const HIGHLIGHT_CARD_COLLECTION_LABELS: Record<
  HighlightCardCollection,
  string
> = {
  benefits: 'Benefits',
  features: 'Features',
}

export const HIGHLIGHT_CARD_PAGE_DESCRIPTIONS: Record<
  HighlightCardCollection,
  string
> = {
  benefits: 'Manage the highlight cards shown in the website Benefits section.',
  features: 'Manage the highlight cards shown in the website Features section.',
}

export const HIGHLIGHT_CARD_COLLECTION_DESCRIPTIONS: Record<
  HighlightCardCollection,
  string
> = {
  benefits:
    'Highlight cards shown in the website Benefits section on the landing page.',
  features:
    'Highlight cards shown in the website Features section on the landing page.',
}

export function canAddHighlightCard(cardCount: number): boolean {
  return cardCount < HIGHLIGHT_CARD_MAX_PER_COLLECTION
}
