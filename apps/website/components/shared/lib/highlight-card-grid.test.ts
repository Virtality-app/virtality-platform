import { describe, expect, it } from 'vitest'
import { shouldShowHighlightCardGrid } from './highlight-card-grid'

describe('highlight card grid visibility', () => {
  it('shows the grid only when the collection has cards', () => {
    expect(shouldShowHighlightCardGrid(undefined)).toBe(false)
    expect(shouldShowHighlightCardGrid([])).toBe(false)
    expect(
      shouldShowHighlightCardGrid([
        {
          id: 'card-1',
          collection: 'benefits',
          title: 'Help patients follow guided movement again',
          body: 'Patients who resist or avoid exercise can start participating.',
          iconName: 'PersonStanding',
          sortOrder: 0,
        },
      ]),
    ).toBe(true)
  })
})
