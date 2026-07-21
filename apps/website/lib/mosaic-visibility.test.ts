import { describe, expect, it } from 'vitest'
import { shouldShowMosaicSection } from './mosaic-visibility'

describe('mosaic section visibility', () => {
  it('shows the section only for a live complete tiling', () => {
    expect(shouldShowMosaicSection({ status: 'live' })).toBe(true)
    expect(shouldShowMosaicSection({ status: 'empty' })).toBe(false)
    expect(
      shouldShowMosaicSection({ status: 'incomplete', errors: ['gap'] }),
    ).toBe(false)
    expect(shouldShowMosaicSection(undefined)).toBe(false)
  })
})
