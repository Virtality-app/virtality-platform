import { describe, expect, it } from 'vitest'
import { isRenderableLucideIcon } from './lucide-icon.ts'

const REACT_FORWARD_REF = Symbol.for('react.forward_ref')

function mockLucideIcon() {
  return {
    $$typeof: REACT_FORWARD_REF,
    render: () => null,
  }
}

function createMockLucideModule(
  entries: Record<string, unknown>,
): Record<string, unknown> {
  return {
    icons: { Activity: mockLucideIcon() },
    createLucideIcon: () => mockLucideIcon(),
    Icon: mockLucideIcon(),
    ...entries,
  }
}

describe('lucide icon resolvability', () => {
  it('accepts names that resolve to forward-ref icon components', () => {
    const lucideModule = createMockLucideModule({
      Activity: mockLucideIcon(),
      BarChartBig: mockLucideIcon(),
    })

    expect(isRenderableLucideIcon('Activity', lucideModule)).toBe(true)
    expect(isRenderableLucideIcon('BarChartBig', lucideModule)).toBe(true)
  })

  it('rejects unknown names and non-glyph exports', () => {
    const lucideModule = createMockLucideModule({
      Activity: mockLucideIcon(),
    })

    expect(isRenderableLucideIcon('NotARealIcon', lucideModule)).toBe(false)
    expect(isRenderableLucideIcon('icons', lucideModule)).toBe(false)
    expect(isRenderableLucideIcon('createLucideIcon', lucideModule)).toBe(false)
    expect(isRenderableLucideIcon('Icon', lucideModule)).toBe(false)
  })

  it('rejects plain functions that are not forward-ref components', () => {
    const lucideModule = createMockLucideModule({
      Activity: () => null,
    })

    expect(isRenderableLucideIcon('Activity', lucideModule)).toBe(false)
  })
})
