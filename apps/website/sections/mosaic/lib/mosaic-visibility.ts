import type { MosaicLiveEligibility } from '@virtality/shared/types'

export function shouldShowMosaicSection(
  eligibility: MosaicLiveEligibility | undefined,
): boolean {
  return eligibility?.status === 'live'
}
