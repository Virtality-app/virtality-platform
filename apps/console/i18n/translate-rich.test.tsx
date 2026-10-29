import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createCatalogTranslate } from './catalog-translate'
import { translateRich } from './translate-rich'

describe('translateRich', () => {
  it('puts the slot element where the translation places it', () => {
    const t = createCatalogTranslate('user', 'el')
    const { container } = render(
      <p>
        {translateRich(t, 'sessions.created', {
          date: <strong>28 Οκτ</strong>,
        })}
      </p>,
    )

    expect(container.innerHTML).toBe(
      '<p>Δημιουργήθηκε: <strong>28 Οκτ</strong></p>',
    )
  })

  it('fills plain placeholders alongside slots', () => {
    const t = createCatalogTranslate('user', 'en')
    const { container } = render(
      <p>
        {translateRich(
          t,
          'billing.pendingCancellation.withDate',
          { date: <b>1 Jan</b> },
          { product: 'Pro' },
        )}
      </p>,
    )

    expect(container.textContent).toBe(
      "Your subscription ends on 1 Jan. You'll keep Pro access until then.",
    )
  })
})
