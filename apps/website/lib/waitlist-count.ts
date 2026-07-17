export const WAITLIST_SOCIAL_PROOF_FLOOR = 35

export function formatWaitlistSocialProofCount(count: number): string {
  return `${Math.max(count, WAITLIST_SOCIAL_PROOF_FLOOR)}+`
}
