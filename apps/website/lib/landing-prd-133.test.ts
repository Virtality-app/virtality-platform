import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { HERO_HEADLINE, HERO_SUPPORTING_COPY } from './hero-content'

const websiteRoot = fileURLToPath(new URL('..', import.meta.url))

function readWebsiteFile(relativePath: string): string {
  return readFileSync(join(websiteRoot, relativePath), 'utf8')
}

const landingPageSectionOrder = [
  '<Hero',
  '<Benefits',
  '<PromoVideo',
  '<Features',
  '<SupportedBy',
  '<CallToAction',
] as const

const landingPageSurfaces = [
  'app/page.tsx',
  'components/home/hero-image-backdrop.tsx',
  'components/home/hero-title.tsx',
  'components/home/benefits.tsx',
  'components/video/promo-video.tsx',
  'components/home/features.tsx',
  'components/home/supported-by/supported-by.tsx',
  'components/home/supported-by/strategic-partners.tsx',
  'components/home/supported-by/clinical-partners.tsx',
  'components/home/supported-by/press-logos.tsx',
  'components/home/call-to-action.tsx',
  'components/layout/navbar.tsx',
] as const

const landingContentModules = [
  ...landingPageSurfaces,
  'lib/hero-content.ts',
  'lib/cta-content.ts',
  'lib/demo-booking.ts',
  'lib/partner-press-content.ts',
  'lib/waitlist-count.ts',
] as const

const landingPageImports = [
  "from '@/components/home/benefits'",
  "from '@/components/home/supported-by'",
] as const

describe('PRD 133 clinic-owner landing page redesign', () => {
  it('composes sections in the approved conversion narrative order', () => {
    const page = readWebsiteFile('app/page.tsx')
    const sectionIndices = landingPageSectionOrder.map((section) => ({
      section,
      index: page.indexOf(section),
    }))

    for (const { section, index } of sectionIndices) {
      expect(index, `missing landing section: ${section}`).toBeGreaterThan(-1)
    }

    for (let i = 1; i < sectionIndices.length; i += 1) {
      const current = sectionIndices[i]!
      const previous = sectionIndices[i - 1]!

      expect(
        current.index,
        `${current.section} should follow ${previous.section}`,
      ).toBeGreaterThan(previous.index)
    }
  })

  it('leads with movement-first hero copy for clinic owners and physiotherapists', () => {
    expect(HERO_HEADLINE).toBe('Because every move matters.')
    expect(HERO_SUPPORTING_COPY).toMatch(/physiotherapist/i)
    expect(HERO_SUPPORTING_COPY).toMatch(/evidence-based VR therapy/i)
  })

  it('centralizes landing content, conversion, and credibility modules', () => {
    const page = readWebsiteFile('app/page.tsx')

    for (const importStatement of landingPageImports) {
      expect(page).toContain(importStatement)
    }

    for (const relativePath of landingContentModules) {
      expect(readWebsiteFile(relativePath).length).toBeGreaterThan(0)
    }
  })

  it('keeps the clinical metrics card available on the benefits grid surface', () => {
    const benefitsGrid = readWebsiteFile('components/home/benefits-grid.tsx')

    expect(benefitsGrid).toContain('PILOT_PROOF_CONTENT.metrics')
    expect(benefitsGrid).toMatch(/rounded-2xl/)
  })
})
