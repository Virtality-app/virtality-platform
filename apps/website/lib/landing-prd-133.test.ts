import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { HERO_HEADLINE, HERO_SUPPORTING_COPY } from './hero-content'
import { LANDING_PAGE_FORBIDDEN_CLAIMS } from './landing-page-content'

const websiteRoot = fileURLToPath(new URL('..', import.meta.url))

function readWebsiteFile(relativePath: string): string {
  return readFileSync(join(websiteRoot, relativePath), 'utf8')
}

const landingPageSectionOrder = [
  '<Hero',
  '<Benefits',
  '<PilotProof',
  '<PromoVideo',
  '<Features',
  '<PoweredBy',
  '<Press',
  '<CallToAction',
] as const

const landingPageSurfaces = [
  'app/page.tsx',
  'components/home/hero-image-backdrop.tsx',
  'components/home/hero-title.tsx',
  'components/home/benefits.tsx',
  'components/home/pilot-proof.tsx',
  'components/video/promo-video.tsx',
  'components/home/features.tsx',
  'components/home/powered-by.tsx',
  'components/home/press.tsx',
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
  "from '@/components/home/pilot-proof'",
  "from '@/components/home/powered-by'",
  "from '@/components/home/press'",
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

  it('does not retain removed broad recovery claims across landing surfaces', () => {
    for (const relativePath of landingPageSurfaces) {
      const content = readWebsiteFile(relativePath)

      for (const forbiddenClaim of LANDING_PAGE_FORBIDDEN_CLAIMS) {
        expect(content).not.toMatch(forbiddenClaim)
      }
    }
  })
})
