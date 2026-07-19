import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  CTA_TRUST_POINTS,
  FINAL_CTA_BOOK_DEMO_LABEL,
  FINAL_CTA_JOIN_WAITLIST_LABEL,
  FINAL_CTA_SUBMIT_LABEL,
} from './cta-content'
import { getDemoBookingUrl } from './demo-booking'
import { features } from '../data/features'
import {
  SETUP_CAPABILITY_CONTENT,
  SETUP_CAPABILITY_TITLE,
} from './landing-page-content'
import {
  formatWaitlistSocialProofCount,
  WAITLIST_SOCIAL_PROOF_FLOOR,
} from './waitlist-count'

const websiteRoot = fileURLToPath(new URL('..', import.meta.url))

function readWebsiteFile(relativePath: string): string {
  return readFileSync(join(websiteRoot, relativePath), 'utf8')
}

describe('PRD 138 capabilities and final CTA choices', () => {
  it('formats waitlist social proof with a floor until the live count exceeds 35', () => {
    expect(WAITLIST_SOCIAL_PROOF_FLOOR).toBe(35)
    expect(formatWaitlistSocialProofCount(0)).toBe('35+')
    expect(formatWaitlistSocialProofCount(35)).toBe('35+')
    expect(formatWaitlistSocialProofCount(36)).toBe('36+')
    expect(formatWaitlistSocialProofCount(120)).toBe('120+')
  })

  it('replaces Remote Monitoring with setup and equipment capability copy', () => {
    const combinedFeatures = features
      .map((feature) => `${feature.title} ${feature.context}`)
      .join(' ')

    expect(combinedFeatures).not.toMatch(/Remote Monitoring/i)
    expect(SETUP_CAPABILITY_TITLE).toBeTruthy()
    expect(SETUP_CAPABILITY_CONTENT).toMatch(/under 40 seconds/i)
    expect(SETUP_CAPABILITY_CONTENT).toMatch(
      /no extra cameras, sensors, cables, or calibration/i,
    )
    expect(SETUP_CAPABILITY_CONTENT).toMatch(/equipment is provided/i)

    const setupFeature = features.find(
      (feature) => feature.title === SETUP_CAPABILITY_TITLE,
    )

    expect(setupFeature?.context).toBe(SETUP_CAPABILITY_CONTENT)
  })

  it('defines CTA trust points for the final conversion area', () => {
    expect(CTA_TRUST_POINTS).toEqual([
      {
        icon: 'Users',
        emphasis: `${WAITLIST_SOCIAL_PROOF_FLOOR}+`,
        label: 'Healthcare Professionals',
        caption: 'in early access program',
      },
      {
        icon: 'TrendingUp',
        emphasis: '97%',
        label: 'Patient Engagement Rate',
        caption: 'sustained throughout treatment',
      },
      {
        icon: 'Clock',
        emphasis: '70-97%',
        label: 'Faster Recovery Time',
        caption: 'vs. traditional therapy',
      },
    ])
  })

  describe('final CTA component wiring', () => {
    const cta = readWebsiteFile('components/home/call-to-action.tsx')

    it('starts with equal waitlist and demo choices', () => {
      expect(FINAL_CTA_JOIN_WAITLIST_LABEL).toBe('Start now')
      expect(FINAL_CTA_SUBMIT_LABEL).toBe('Submit')
      expect(FINAL_CTA_BOOK_DEMO_LABEL).toBe('Book a 20-minute demo')
      expect(cta).toMatch(/FINAL_CTA_JOIN_WAITLIST_LABEL/)
      expect(cta).toMatch(/FINAL_CTA_SUBMIT_LABEL/)
      expect(cta).toMatch(/FINAL_CTA_BOOK_DEMO_LABEL/)
      expect(cta).toMatch(/showWaitlistForm/)
      expect(cta).toMatch(/PartnerRowLabel/)
      expect(cta).not.toMatch(
        /\n\s*<WaitlistForm\s*\/>\n\s*<div className='mt-10 border-t/,
      )
    })

    it('replaces start now with the waitlist input and submit button', () => {
      expect(cta).toMatch(
        /showWaitlistForm \? \([\s\S]*<WaitlistForm[\s\S]*submitLabel=\{FINAL_CTA_SUBMIT_LABEL\}/,
      )
      expect(cta).toMatch(/: \(\s*<Button[\s\S]*FINAL_CTA_JOIN_WAITLIST_LABEL/)
    })

    it('opens the configured demo booking destination', () => {
      expect(cta).toMatch(/getDemoBookingUrl/)
      expect(cta).not.toMatch(/https:\/\/cal\.com/)
      expect(
        getDemoBookingUrl({
          NEXT_PUBLIC_DEMO_BOOKING_URL: 'https://cal.com/virtality/demo',
        }),
      ).toBe('https://cal.com/virtality/demo')
    })

    it('uses floored waitlist social proof in trust points without a duplicate count block', () => {
      expect(CTA_TRUST_POINTS[0]?.emphasis).toBe(
        `${WAITLIST_SOCIAL_PROOF_FLOOR}+`,
      )
      expect(CTA_TRUST_POINTS[0]?.label).toBe('Healthcare Professionals')
      expect(CTA_TRUST_POINTS[0]?.caption).toBe('in early access program')
      expect(cta).toMatch(/CTA_TRUST_POINTS/)
      expect(cta).toMatch(/point\.emphasis/)
      expect(cta).toMatch(/point\.caption/)
      expect(cta).not.toMatch(/formatWaitlistSocialProofCount/)
      expect(cta).not.toMatch(/useWaitlist/)
    })
  })
})
