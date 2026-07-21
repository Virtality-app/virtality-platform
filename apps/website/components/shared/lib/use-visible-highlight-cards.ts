'use client'

import { useHighlightCards } from '@virtality/react-query'
import type { HighlightCardCollection } from '@virtality/shared/types'
import { shouldShowHighlightCards } from './highlight-card-visibility'

export function useVisibleHighlightCards(collection: HighlightCardCollection) {
  const { data, isPending } = useHighlightCards(collection)

  if (isPending || !shouldShowHighlightCards(data)) {
    return { cards: undefined }
  }

  return { cards: data }
}
