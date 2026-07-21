import { describe, expect, it } from 'vitest'
import { shouldShowHighlightCards } from './highlight-card-visibility'

describe('highlight card visibility', () => {
  it('shows the card grid only when the collection has at least one card', () => {
    expect(shouldShowHighlightCards(undefined)).toBe(false)
    expect(shouldShowHighlightCards([])).toBe(false)
    expect(
      shouldShowHighlightCards([
        {
          id: 'card-1',
          collection: 'benefits',
          title: 'Benefit',
          body: 'Body',
          iconName: 'Activity',
          sortOrder: 0,
        },
      ]),
    ).toBe(true)
  })
})
