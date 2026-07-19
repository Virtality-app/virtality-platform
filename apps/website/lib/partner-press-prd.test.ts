import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { PRESS_LOGO_ITEMS } from './partner-press-content'
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
    expect(hasPartnerSection([], [])).toBe(false)
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
  })

  it('shows the press section when static press logos are configured', () => {
    expect(hasPressSection(PRESS_LOGO_ITEMS)).toBe(true)
    expect(PRESS_LOGO_ITEMS.length).toBeGreaterThan(0)
  })

  it('opens press items with URLs in a new tab', () => {
    expect(getPressLinkProps('https://example.com/article')).toEqual({
      target: '_blank',
      rel: 'noopener noreferrer',
    })
    expect(getPressLinkProps()).toEqual({})
    expect(getPressLinkProps('   ')).toEqual({})
  })

  it('drives partner rendering from the public list and press from static data', () => {
    const supportedBy = readWebsiteFile(
      'components/home/supported-by/supported-by.tsx',
    )
    const strategic = readWebsiteFile(
      'components/home/supported-by/strategic-partners.tsx',
    )
    const clinical = readWebsiteFile(
      'components/home/supported-by/clinical-partners.tsx',
    )
    const press = readWebsiteFile(
      'components/home/supported-by/press-logos.tsx',
    )

    expect(supportedBy).toMatch(/usePartnerLogos/)
    expect(supportedBy).toMatch(/mapPartnerLogosToCredibilityLists/)
    expect(supportedBy).toMatch(/getVisiblePartnerRows/)
    expect(supportedBy).not.toMatch(/piraeus-logo\.png/)
    expect(strategic).toMatch(/CredibilityLogo/)
    expect(clinical).toMatch(/CredibilityLogo/)
    expect(press).toMatch(/PRESS_LOGO_ITEMS/)
    expect(press).toMatch(/filterValidLogoItems/)
    expect(press).toMatch(/getPressLinkProps/)
  })

  it('uses the same subtle hover treatment for partner and press logos', () => {
    const credibilityLogo = readWebsiteFile(
      'components/home/credibility-logo.tsx',
    )
    const strategic = readWebsiteFile(
      'components/home/supported-by/strategic-partners.tsx',
    )
    const clinical = readWebsiteFile(
      'components/home/supported-by/clinical-partners.tsx',
    )
    const press = readWebsiteFile(
      'components/home/supported-by/press-logos.tsx',
    )

    expect(credibilityLogo).toMatch(/CREDIBILITY_LOGO_HOVER_CLASS/)
    expect(strategic).toMatch(/CredibilityLogo/)
    expect(clinical).toMatch(/CredibilityLogo/)
    expect(press).toMatch(/CredibilityLogo/)
    expect(CREDIBILITY_LOGO_HOVER_CLASS).toMatch(/opacity-35/)
  })

  it('places supported-by before the final CTA', () => {
    const page = readWebsiteFile('app/page.tsx')
    const supportedByIndex = page.indexOf('<SupportedBy')
    const callToActionIndex = page.indexOf('<CallToAction')

    expect(supportedByIndex).toBeGreaterThan(-1)
    expect(callToActionIndex).toBeGreaterThan(-1)
    expect(callToActionIndex).toBeGreaterThan(supportedByIndex)
  })
})
