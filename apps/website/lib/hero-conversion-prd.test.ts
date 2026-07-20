import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  HERO_BADGE_LABEL,
  HERO_HEADLINE,
  HERO_PRIMARY_CTA_LABEL,
  HERO_SECONDARY_CTA_LABEL,
  HERO_SUPPORTING_COPY,
  NAV_BOOK_DEMO_LABEL,
} from './hero-content'
import { DEMO_BOOKING_URL_ENV, getDemoBookingUrl } from './demo-booking'

const websiteRoot = fileURLToPath(new URL('..', import.meta.url))

function readWebsiteFile(relativePath: string): string {
  return readFileSync(join(websiteRoot, relativePath), 'utf8')
}

describe('hero conversion path (PRD 133 / issue 134)', () => {
  it('resolves demo booking URL from one public environment variable', () => {
    expect(DEMO_BOOKING_URL_ENV).toBe('NEXT_PUBLIC_DEMO_BOOKING_URL')
    expect(
      getDemoBookingUrl({
        NEXT_PUBLIC_DEMO_BOOKING_URL: 'https://cal.com/virtality',
      }),
    ).toBe('https://cal.com/virtality')
    expect(() => getDemoBookingUrl({})).toThrow(
      'NEXT_PUBLIC_DEMO_BOOKING_URL is not set',
    )
  })

  it('defines hero copy that leads with movement and physiotherapist VR therapy', () => {
    expect(HERO_BADGE_LABEL).toBe('Evidence-Based VR Therapy')
    expect(HERO_HEADLINE).toBe('Because every move matters.')
    expect(HERO_SUPPORTING_COPY).toMatch(/physiotherapist/i)
    expect(HERO_SUPPORTING_COPY).toMatch(/evidence-based VR therapy/i)
  })

  it('preserves the CDN headset image in the legacy hero', () => {
    const heroLegacy = readWebsiteFile('components/home/hero_legacy.tsx')

    expect(heroLegacy).toMatch(
      /https:\/\/cdn\.virtality\.app\/f0c18d8ef3258c8510bbf79bba1f3872241bdab6c8251c9724e4e766132a5b20/,
    )
  })

  it('routes hero primary CTA to the final CTA with free-trial copy', () => {
    const heroTitle = readWebsiteFile('components/home/hero-title.tsx')

    expect(heroTitle).toMatch(/HERO_BADGE_LABEL/)
    expect(heroTitle).toMatch(/HERO_PRIMARY_CTA_LABEL/)
    expect(heroTitle).toMatch(/scrollToFinalCta/)
    expect(heroTitle).not.toMatch(/View Features/)
    expect(HERO_PRIMARY_CTA_LABEL).toBe('Try Virtality free for two weeks')
  })

  it('routes hero secondary CTA through the configured demo booking destination', () => {
    const heroTitle = readWebsiteFile('components/home/hero-title.tsx')

    expect(heroTitle).toMatch(/HERO_SECONDARY_CTA_LABEL/)
    expect(heroTitle).toMatch(/getDemoBookingUrl/)
    expect(heroTitle).not.toMatch(/https:\/\/cal\.com\/virtality/)
    expect(HERO_SECONDARY_CTA_LABEL).toBe('Book a 30-minute demo')
  })

  it('adds navbar Book a demo action that scrolls to the final CTA', () => {
    const navbar = readWebsiteFile('components/layout/navbar.tsx')

    expect(navbar).toMatch(/NAV_BOOK_DEMO_LABEL/)
    expect(navbar).toMatch(/ScrollToCtaButton/)
    expect(NAV_BOOK_DEMO_LABEL).toBe('Book a demo')
  })

  it('avoids hard-coded booking URLs in hero conversion modules', () => {
    for (const relativePath of [
      'components/home/hero-title.tsx',
      'components/layout/navbar.tsx',
      'lib/demo-booking.ts',
      'lib/hero-content.ts',
      'lib/scroll-to-cta.ts',
    ]) {
      const source = readWebsiteFile(relativePath)
      expect(source).not.toMatch(/https:\/\/cal\.com/)
    }
  })
})
