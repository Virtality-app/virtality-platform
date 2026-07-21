import { WAITLIST_SOCIAL_PROOF_FLOOR } from '@/lib/waitlist-count'

export const FINAL_CTA_JOIN_WAITLIST_LABEL = 'Start now'

export const FINAL_CTA_SUBMIT_LABEL = 'Submit'

export const FINAL_CTA_BOOK_DEMO_LABEL = 'Book a 20-minute demo'

export type CtaTrustPointIconName = 'Users' | 'TrendingUp' | 'Clock'

export type CtaTrustPoint = {
  icon: CtaTrustPointIconName
  emphasis: string
  label: string
  caption: string
}

export const CTA_TRUST_POINTS: readonly CtaTrustPoint[] = [
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
]
