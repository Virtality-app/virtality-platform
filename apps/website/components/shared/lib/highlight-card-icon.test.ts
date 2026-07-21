import { describe, expect, it } from 'vitest'
import { resolveHighlightCardIcon } from './highlight-card-icon'

const REACT_FORWARD_REF = Symbol.for('react.forward_ref')

function mockLucideIcon() {
  return {
    $$typeof: REACT_FORWARD_REF,
    render: () => null,
  }
}

function createMockLucideModule(entries: Record<string, unknown> = {}) {
  return {
    icons: { Activity: mockLucideIcon() },
    createLucideIcon: () => mockLucideIcon(),
    Icon: mockLucideIcon(),
    ...entries,
  }
}

describe('highlight card icon resolution', () => {
  it('returns a renderable icon component for valid names', () => {
    const activity = mockLucideIcon()
    const lucideModule = createMockLucideModule({ Activity: activity })

    expect(resolveHighlightCardIcon('Activity', lucideModule)).toBe(activity)
  })

  it('returns null for missing, unknown, or non-glyph exports', () => {
    const lucideModule = createMockLucideModule({
      Activity: mockLucideIcon(),
    })

    expect(resolveHighlightCardIcon(undefined, lucideModule)).toBeNull()
    expect(resolveHighlightCardIcon('NotARealIcon', lucideModule)).toBeNull()
    expect(resolveHighlightCardIcon('icons', lucideModule)).toBeNull()
    expect(
      resolveHighlightCardIcon('createLucideIcon', lucideModule),
    ).toBeNull()
    expect(resolveHighlightCardIcon('Icon', lucideModule)).toBeNull()
  })
})
