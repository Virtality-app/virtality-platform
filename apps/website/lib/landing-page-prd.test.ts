import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  LANDING_BENEFITS,
  LANDING_PAGE_FORBIDDEN_CLAIMS,
  PILOT_PROOF_CONTENT,
} from './landing-page-content'

const websiteRoot = fileURLToPath(new URL('..', import.meta.url))

function readWebsiteFile(relativePath: string): string {
  return readFileSync(join(websiteRoot, relativePath), 'utf8')
}

const landingPageSurfaces = [
  'app/page.tsx',
  'components/home/benefits.tsx',
  'components/home/pilot-proof.tsx',
  'components/home/features.tsx',
  'components/home/call-to-action.tsx',
  'components/video/promo-video.tsx',
  'components/home/hero-image-backdrop.tsx',
  'components/home/hero-title.tsx',
  'components/home/supported-by/supported-by.tsx',
  'components/home/supported-by/strategic-partners.tsx',
  'components/home/supported-by/clinical-partners.tsx',
  'components/home/supported-by/press-logos.tsx',
]

describe('PRD 135 landing page benefits and pilot-proof narrative', () => {
  it('orders benefits and pilot proof before the how-it-works video', () => {
    const page = readWebsiteFile('app/page.tsx')
    const benefitsIndex = page.indexOf('<Benefits')
    const pilotProofIndex = page.indexOf('<PilotProof')
    const promoVideoIndex = page.indexOf('<PromoVideo')

    expect(benefitsIndex).toBeGreaterThan(-1)
    expect(pilotProofIndex).toBeGreaterThan(-1)
    expect(benefitsIndex).toBeLessThan(promoVideoIndex)
    expect(pilotProofIndex).toBeLessThan(promoVideoIndex)
    expect(pilotProofIndex).toBeGreaterThan(benefitsIndex)
  })

  it('defines six approved benefit items with careful condition support wording', () => {
    expect(LANDING_BENEFITS).toHaveLength(6)

    const combinedBenefits = LANDING_BENEFITS.map(
      (benefit) => `${benefit.title} ${benefit.description}`,
    ).join(' ')

    expect(combinedBenefits).toMatch(/kinesiophobia/)
    expect(combinedBenefits).toMatch(/chronic pain/)
    expect(combinedBenefits).toMatch(/fibromyalgia/)
    expect(combinedBenefits).toMatch(/tendinopathy/)
    expect(combinedBenefits).toMatch(/reducing fear/)
    expect(combinedBenefits).toMatch(/guided movement/)
    expect(combinedBenefits).not.toMatch(
      /treat(s|ing)?\s+(kinesiophobia|chronic pain|fibromyalgia|tendinopathy)/i,
    )
    expect(combinedBenefits).not.toMatch(/cure/i)
  })

  it('frames pilot proof with days-not-months and two targeted sessions as pilot data', () => {
    const combinedPilotProof = [
      PILOT_PROOF_CONTENT.eyebrow,
      PILOT_PROOF_CONTENT.title,
      PILOT_PROOF_CONTENT.intro,
      ...PILOT_PROOF_CONTENT.highlights.map(
        (highlight) => `${highlight.title} ${highlight.description}`,
      ),
      PILOT_PROOF_CONTENT.disclaimer,
    ].join(' ')

    expect(combinedPilotProof).toMatch(/days, not months/i)
    expect(combinedPilotProof).toMatch(/pilot data/i)
    expect(combinedPilotProof).toMatch(/2 targeted sessions/i)
    expect(combinedPilotProof).not.toMatch(/guarantee/i)
  })

  it('does not retain removed broad recovery claims on landing page surfaces', () => {
    for (const relativePath of landingPageSurfaces) {
      const content = readWebsiteFile(relativePath)

      for (const forbiddenClaim of LANDING_PAGE_FORBIDDEN_CLAIMS) {
        expect(content).not.toMatch(forbiddenClaim)
      }
    }
  })

  it('removes the dead case-studies link from benefits', () => {
    const benefits = readWebsiteFile('components/home/benefits.tsx')

    expect(benefits).not.toMatch(/case-studies/)
    expect(benefits).not.toMatch(/View Clinical Case Studies/)
  })
})
