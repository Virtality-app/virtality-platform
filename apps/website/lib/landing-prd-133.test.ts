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

const PRD_133_SECTION_ORDER = [
  '<Hero',
  '<Benefits',
  '<PilotProof',
  '<PromoVideo',
  '<Features',
  '<PoweredBy',
  '<Press',
  '<CallToAction',
] as const

const PRD_133_CONTENT_SURFACES = [
  'app/page.tsx',
  'components/home/hero.tsx',
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

const PRD_133_CONTENT_MODULES = [
  ...PRD_133_CONTENT_SURFACES,
  'lib/hero-content.ts',
  'lib/cta-content.ts',
  'lib/demo-booking.ts',
  'lib/partner-press-content.ts',
  'lib/waitlist-count.ts',
] as const

describe('PRD 133 clinic-owner landing page redesign', () => {
  it('composes sections in the approved conversion narrative order', () => {
    const page = readWebsiteFile('app/page.tsx')
    const indices = PRD_133_SECTION_ORDER.map((section) =>
      page.indexOf(section),
    )

    for (const index of indices) {
      expect(index).toBeGreaterThan(-1)
    }

    for (let i = 1; i < indices.length; i += 1) {
      expect(indices[i]).toBeGreaterThan(indices[i - 1]!)
    }
  })

  it('leads with movement-first hero copy for clinic owners and physiotherapists', () => {
    expect(HERO_HEADLINE).toBe('Because every move matters.')
    expect(HERO_SUPPORTING_COPY).toMatch(/physiotherapist/i)
    expect(HERO_SUPPORTING_COPY).toMatch(/evidence-based VR therapy/i)
  })

  it('centralizes landing content, conversion, and credibility modules', () => {
    const page = readWebsiteFile('app/page.tsx')

    expect(page).toMatch(/from '@\/components\/home\/benefits'/)
    expect(page).toMatch(/from '@\/components\/home\/pilot-proof'/)
    expect(page).toMatch(/from '@\/components\/home\/powered-by'/)
    expect(page).toMatch(/from '@\/components\/home\/press'/)

    for (const relativePath of PRD_133_CONTENT_MODULES) {
      expect(() => readWebsiteFile(relativePath)).not.toThrow()
    }
  })

  it('does not retain removed broad recovery claims across landing surfaces', () => {
    for (const relativePath of PRD_133_CONTENT_SURFACES) {
      const content = readWebsiteFile(relativePath)

      for (const forbiddenClaim of LANDING_PAGE_FORBIDDEN_CLAIMS) {
        expect(content).not.toMatch(forbiddenClaim)
      }
    }
  })
})
