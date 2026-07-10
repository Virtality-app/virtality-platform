import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  CLINICAL_PARTNER_LOGOS,
  PRESS_LOGO_ITEMS,
  STRATEGIC_PARTNER_LOGOS,
} from './partner-press-content'
import {
  CREDIBILITY_LOGO_HOVER_CLASS,
  filterValidLogoItems,
  getPressLinkProps,
  getVisiblePartnerRows,
  hasPartnerSection,
  hasPressSection,
  isValidLogoItem,
} from './partner-press'

const websiteRoot = fileURLToPath(new URL('..', import.meta.url))

function readWebsiteFile(relativePath: string): string {
  return readFileSync(join(websiteRoot, relativePath), 'utf8')
}

describe('PRD 136 partner and press sections', () => {
  it('treats logo items as valid only when src and alt are present', () => {
    expect(isValidLogoItem({ src: '/logo.png', alt: 'Partner' })).toBe(true)
    expect(isValidLogoItem({ src: ' ', alt: 'Partner' })).toBe(false)
    expect(isValidLogoItem({ src: '/logo.png', alt: '' })).toBe(false)
    expect(
      filterValidLogoItems([
        { src: '/a.png', alt: 'A' },
        { src: '', alt: 'B' },
      ]),
    ).toEqual([{ src: '/a.png', alt: 'A' }])
  })

  it('hides partner rows when no valid logo items exist', () => {
    expect(getVisiblePartnerRows([], [])).toEqual([])
    expect(
      getVisiblePartnerRows(
        [{ src: ' ', alt: 'Missing asset' }],
        [{ src: '', alt: 'Also missing' }],
      ),
    ).toEqual([])
    expect(
      hasPartnerSection(STRATEGIC_PARTNER_LOGOS, CLINICAL_PARTNER_LOGOS),
    ).toBe(false)
  })

  it('renders strategic and clinical rows only when valid logos exist', () => {
    const strategic = [{ src: '/strategic.png', alt: 'Strategic partner' }]
    const clinical = [
      { src: '/clinical.png', alt: 'Clinical partner', wide: true },
    ]

    expect(getVisiblePartnerRows(strategic, [])).toEqual([
      { kind: 'strategic', logos: strategic },
    ])
    expect(getVisiblePartnerRows([], clinical)).toEqual([
      { kind: 'clinical', logos: clinical },
    ])
    expect(getVisiblePartnerRows(strategic, clinical)).toEqual([
      { kind: 'strategic', logos: strategic },
      { kind: 'clinical', logos: clinical },
    ])
    expect(hasPartnerSection(strategic, clinical)).toBe(true)
  })

  it('hides the press section when no valid press items exist', () => {
    expect(hasPressSection([])).toBe(false)
    expect(hasPressSection([{ src: '', alt: 'Missing press logo' }])).toBe(
      false,
    )
    expect(hasPressSection(PRESS_LOGO_ITEMS)).toBe(false)
  })

  it('opens press items with URLs in a new tab', () => {
    expect(getPressLinkProps('https://example.com/article')).toEqual({
      target: '_blank',
      rel: 'noopener noreferrer',
    })
    expect(getPressLinkProps()).toEqual({})
    expect(getPressLinkProps('   ')).toEqual({})
  })

  it('drives partner and press rendering from static data modules', () => {
    const poweredBy = readWebsiteFile('components/home/powered-by.tsx')
    const press = readWebsiteFile('components/home/press.tsx')

    expect(poweredBy).toMatch(/STRATEGIC_PARTNER_LOGOS/)
    expect(poweredBy).toMatch(/CLINICAL_PARTNER_LOGOS/)
    expect(poweredBy).toMatch(/getVisiblePartnerRows/)
    expect(poweredBy).not.toMatch(/piraeus-logo\.png/)
    expect(press).toMatch(/PRESS_LOGO_ITEMS/)
    expect(press).toMatch(/filterValidLogoItems/)
    expect(press).toMatch(/getPressLinkProps/)
  })

  it('uses the same subtle hover treatment for partner and press logos', () => {
    const credibilityLogo = readWebsiteFile(
      'components/home/credibility-logo.tsx',
    )
    const poweredBy = readWebsiteFile('components/home/powered-by.tsx')
    const press = readWebsiteFile('components/home/press.tsx')

    expect(credibilityLogo).toMatch(/CREDIBILITY_LOGO_HOVER_CLASS/)
    expect(poweredBy).toMatch(/CredibilityLogo/)
    expect(press).toMatch(/CredibilityLogo/)
    expect(CREDIBILITY_LOGO_HOVER_CLASS).toMatch(/opacity-35/)
  })

  it('places press after supported-by and before the final CTA', () => {
    const page = readWebsiteFile('app/page.tsx')
    const poweredByIndex = page.indexOf('<PoweredBy')
    const pressIndex = page.indexOf('<Press')
    const callToActionIndex = page.indexOf('<CallToAction')

    expect(poweredByIndex).toBeGreaterThan(-1)
    expect(pressIndex).toBeGreaterThan(-1)
    expect(callToActionIndex).toBeGreaterThan(-1)
    expect(pressIndex).toBeGreaterThan(poweredByIndex)
    expect(callToActionIndex).toBeGreaterThan(pressIndex)
  })
})
