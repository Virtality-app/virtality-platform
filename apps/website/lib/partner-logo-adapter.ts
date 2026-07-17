import type { PartnerLogoListItem } from '@virtality/shared/types'
import type { CredibilityLogoItem } from './partner-press-content'

export type PartnerCredibilityLists = {
  strategicLogos: CredibilityLogoItem[]
  clinicalLogos: CredibilityLogoItem[]
}

export function mapPartnerLogoToCredibilityItem(
  item: Pick<PartnerLogoListItem, 'cdnUrl' | 'alt'>,
): CredibilityLogoItem {
  return {
    src: item.cdnUrl,
    alt: item.alt,
  }
}

export function mapPartnerLogosToCredibilityLists(
  items: readonly PartnerLogoListItem[],
): PartnerCredibilityLists {
  const strategicLogos: CredibilityLogoItem[] = []
  const clinicalLogos: CredibilityLogoItem[] = []

  for (const item of items) {
    const logo = mapPartnerLogoToCredibilityItem(item)

    switch (item.category) {
      case 'strategic':
        strategicLogos.push(logo)
        break
      case 'clinical':
        clinicalLogos.push(logo)
        break
    }
  }

  return { strategicLogos, clinicalLogos }
}
