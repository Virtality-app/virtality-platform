import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockUseCreateHighlightCard = vi.fn()
const mockUseUpdateHighlightCard = vi.fn()

vi.mock('@virtality/react-query', () => ({
  useCreateHighlightCard: () => mockUseCreateHighlightCard(),
  useUpdateHighlightCard: () => mockUseUpdateHighlightCard(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { HighlightCardFormDialog } from './highlight-card-form-dialog'

describe('HighlightCardFormDialog', () => {
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
  })

  it('keeps the dialog content within the viewport with overflow containment', () => {
    render(
      <HighlightCardFormDialog
        collection='benefits'
        card={null}
        mode='create'
        onClose={vi.fn()}
      />,
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toMatch(/max-h-/)
    expect(dialog.className).toMatch(/overflow-hidden/)
    expect(screen.getByText('Add highlight card')).toBeInTheDocument()
  })
})
