import { HIGHLIGHT_CARD_MAX_PER_COLLECTION } from '@virtality/shared/types'
import { describe, expect, it } from 'vitest'
import { canAddHighlightCard } from './highlight-cards'

describe('canAddHighlightCard', () => {
  it('allows add when the collection is below the max', () => {
    expect(canAddHighlightCard(HIGHLIGHT_CARD_MAX_PER_COLLECTION - 1)).toBe(
      true,
    )
  })

  it('blocks add when the collection is at the max', () => {
    expect(canAddHighlightCard(HIGHLIGHT_CARD_MAX_PER_COLLECTION)).toBe(false)
  })
})
