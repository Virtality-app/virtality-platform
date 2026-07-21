'use client'

import { useHighlightCards } from '@virtality/react-query'
import type { HighlightCardCollection } from '@virtality/shared/types'
import { shouldShowHighlightCards } from './highlight-card-visibility'

export function useVisibleHighlightCards(collection: HighlightCardCollection) {
  const { data, isPending } = useHighlightCards(collection)

  const cards = !isPending && shouldShowHighlightCards(data) ? data : undefined

  return { cards }
}
