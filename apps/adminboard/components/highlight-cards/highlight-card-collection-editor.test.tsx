import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockUseHighlightCards = vi.fn()
const mockUseCreateHighlightCard = vi.fn()
const mockUseUpdateHighlightCard = vi.fn()
const mockUseReorderHighlightCard = vi.fn()
const mockUseRemoveHighlightCard = vi.fn()

vi.mock('@virtality/react-query', () => ({
  useHighlightCards: (...args: unknown[]) => mockUseHighlightCards(...args),
  useCreateHighlightCard: () => mockUseCreateHighlightCard(),
  useUpdateHighlightCard: () => mockUseUpdateHighlightCard(),
  useReorderHighlightCard: () => mockUseReorderHighlightCard(),
  useRemoveHighlightCard: () => mockUseRemoveHighlightCard(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { HighlightCardCollectionEditor } from './highlight-card-collection-editor'

describe('HighlightCardCollectionEditor', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseCreateHighlightCard.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    })
    mockUseUpdateHighlightCard.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    })
    mockUseReorderHighlightCard.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    })
    mockUseRemoveHighlightCard.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    })
  })

  it('shows an empty dashed state when the collection has no cards', () => {
    mockUseHighlightCards.mockReturnValue({
      data: [],
      isPending: false,
    })

    render(<HighlightCardCollectionEditor collection='benefits' />)

    expect(
      screen.getByText(
        /No cards yet. Empty collection hides the website grid./,
      ),
    ).toBeInTheDocument()
  })

  it('disables add when the collection already has six cards', () => {
    mockUseHighlightCards.mockReturnValue({
      data: Array.from({ length: 6 }, (_, index) => ({
        id: `card-${index}`,
        collection: 'benefits',
        title: `Card ${index}`,
        body: `Body ${index}`,
        iconName: 'Activity',
        sortOrder: index,
      })),
      isPending: false,
    })

    render(<HighlightCardCollectionEditor collection='benefits' />)

    expect(screen.getByRole('button', { name: /Add card/i })).toBeDisabled()
  })
})
