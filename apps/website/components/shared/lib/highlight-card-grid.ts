import type { HighlightCardListItem } from '@virtality/shared/types'

export function shouldShowHighlightCardGrid(
  cards: HighlightCardListItem[] | undefined,
): boolean {
  return Array.isArray(cards) && cards.length > 0
}
