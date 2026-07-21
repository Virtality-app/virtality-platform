import { describe, expect, it } from 'vitest'
import {
  formatWaitlistSocialProofCount,
  WAITLIST_SOCIAL_PROOF_FLOOR,
} from './waitlist-count'

describe('waitlist social proof count', () => {
  it('formats with a floor until the live count exceeds the floor', () => {
    expect(WAITLIST_SOCIAL_PROOF_FLOOR).toBe(35)
    expect(formatWaitlistSocialProofCount(0)).toBe('35+')
    expect(formatWaitlistSocialProofCount(35)).toBe('35+')
    expect(formatWaitlistSocialProofCount(36)).toBe('36+')
    expect(formatWaitlistSocialProofCount(120)).toBe('120+')
  })
})
