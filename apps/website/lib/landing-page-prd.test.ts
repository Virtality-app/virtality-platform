import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { LANDING_BENEFITS, PILOT_PROOF_CONTENT } from './landing-page-content'

const websiteRoot = fileURLToPath(new URL('..', import.meta.url))

function readWebsiteFile(relativePath: string): string {
  return readFileSync(join(websiteRoot, relativePath), 'utf8')
}

describe('PRD 135 landing page benefits and pilot-proof narrative', () => {
  it('orders pilot proof and benefits before the how-it-works video', () => {
    const page = readWebsiteFile('app/page.tsx')
    const benefitsIndex = page.indexOf('<Benefits')
    const pilotProofIndex = page.indexOf('<PilotProof')
    const promoVideoIndex = page.indexOf('<PromoVideo')

    expect(benefitsIndex).toBeGreaterThan(-1)
    expect(pilotProofIndex).toBeGreaterThan(-1)
    expect(benefitsIndex).toBeLessThan(promoVideoIndex)
    expect(pilotProofIndex).toBeLessThan(promoVideoIndex)
    expect(pilotProofIndex).toBeLessThan(benefitsIndex)
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

  it('shows the clinical metrics card in the pilot section', () => {
    expect(PILOT_PROOF_CONTENT.metrics).toHaveLength(3)

    const combinedMetrics = PILOT_PROOF_CONTENT.metrics
      .map((metric) => `${metric.value} ${metric.label} ${metric.caption}`)
      .join(' ')

    expect(combinedMetrics).toMatch(/70-97%/)
    expect(combinedMetrics).toMatch(/Faster Recovery Rate/)
    expect(combinedMetrics).toMatch(/Patient Engagement/)
    expect(combinedMetrics).toMatch(/2\.5x/)
    expect(combinedMetrics).toMatch(/Increased Efficiency/)

    const pilotProof = readWebsiteFile('components/home/pilot-proof.tsx')
    expect(pilotProof).toContain('PILOT_PROOF_CONTENT.metrics')
  })

  it('removes the dead case-studies link from benefits', () => {
    const benefits = readWebsiteFile('components/home/benefits.tsx')

    expect(benefits).not.toMatch(/case-studies/)
    expect(benefits).not.toMatch(/View Clinical Case Studies/)
  })
})
