// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { maskReplayInput } from './posthog-replay-privacy.ts'

function inputIn(html: string): HTMLInputElement {
  document.body.innerHTML = html
  return document.querySelector('input')!
}

describe('maskReplayInput', () => {
  it('masks inputs by default', () => {
    expect(maskReplayInput('Maria', inputIn('<input />'))).toBe('*****')
  })

  it('shows inputs marked as safe', () => {
    expect(maskReplayInput('12', inputIn('<input data-ph-unmask />'))).toBe(
      '12',
    )
  })

  it('shows inputs inside a safe container', () => {
    expect(
      maskReplayInput('12', inputIn('<div data-ph-unmask><input /></div>')),
    ).toBe('12')
  })

  it('keeps sensitive inputs masked inside a safe container', () => {
    expect(
      maskReplayInput(
        'Maria',
        inputIn(
          '<div data-ph-unmask><div class="ph-sensitive"><input /></div></div>',
        ),
      ),
    ).toBe('*****')
  })

  it('never shows passwords', () => {
    expect(
      maskReplayInput(
        'secret',
        inputIn('<input type="password" data-ph-unmask />'),
      ),
    ).toBe('******')
  })
})
