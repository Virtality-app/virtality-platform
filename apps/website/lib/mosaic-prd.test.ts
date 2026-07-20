import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { MOSAIC_SECTION_CONTENT } from './mosaic-content'
import { shouldShowMosaicSection } from './mosaic-visibility'

const websiteRoot = fileURLToPath(new URL('..', import.meta.url))

function readWebsiteFile(relativePath: string): string {
  return readFileSync(join(websiteRoot, relativePath), 'utf8')
}

describe('PRD 153 issue 156 landing mosaic section shell', () => {
  it('shows the section only for a live complete tiling', () => {
    expect(shouldShowMosaicSection({ status: 'live' })).toBe(true)
    expect(shouldShowMosaicSection({ status: 'empty' })).toBe(false)
    expect(
      shouldShowMosaicSection({ status: 'incomplete', errors: ['gap'] }),
    ).toBe(false)
    expect(shouldShowMosaicSection(undefined)).toBe(false)
  })

  it('places the mosaic section after testimonials and before promo video', () => {
    const page = readWebsiteFile('app/page.tsx')
    const testimonialsIndex = page.indexOf('<Testimonials')
    const mosaicIndex = page.indexOf('<MosaicSection')
    const promoVideoIndex = page.indexOf('<PromoVideo')

    expect(testimonialsIndex).toBeGreaterThan(-1)
    expect(mosaicIndex).toBeGreaterThan(-1)
    expect(promoVideoIndex).toBeGreaterThan(-1)
    expect(mosaicIndex).toBeGreaterThan(testimonialsIndex)
    expect(promoVideoIndex).toBeGreaterThan(mosaicIndex)
  })

  it('keeps hardcoded section chrome in a code-owned content module', () => {
    expect(MOSAIC_SECTION_CONTENT.eyebrow.length).toBeGreaterThan(0)
    expect(MOSAIC_SECTION_CONTENT.headline.length).toBeGreaterThan(0)
    expect(MOSAIC_SECTION_CONTENT.description.length).toBeGreaterThan(0)

    const mosaicSection = readWebsiteFile(
      'components/home/mosaic/mosaic-section.tsx',
    )

    expect(mosaicSection).toMatch(/MOSAIC_SECTION_CONTENT/)
    expect(mosaicSection).not.toMatch(/useState.*headline|editable/i)
  })

  it('wires the section to the public mosaic query and hides when not live', () => {
    const mosaicSection = readWebsiteFile(
      'components/home/mosaic/mosaic-section.tsx',
    )

    expect(mosaicSection).toMatch(/useMosaic/)
    expect(mosaicSection).toMatch(/shouldShowMosaicSection/)
    expect(mosaicSection).toMatch(/return null/)
    expect(mosaicSection).toMatch(/tiles\.map/)
  })
})
