import type {
  PartnerLogoCategory,
  PartnerLogoListItem,
} from '@virtality/shared/types'

export type PartnerLogoCategoryLists = Record<
  PartnerLogoCategory,
  PartnerLogoListItem[]
>

export const PARTNER_LOGO_CATEGORIES = [
  'strategic',
  'clinical',
] as const satisfies readonly PartnerLogoCategory[]

export const PARTNER_LOGO_CATEGORY_LABELS: Record<PartnerLogoCategory, string> =
  {
    strategic: 'Strategic',
    clinical: 'Clinical',
  }

export const PARTNER_LOGO_CATEGORY_DESCRIPTIONS: Record<
  PartnerLogoCategory,
  string
> = {
  strategic:
    'Institutional or programme partners shown in the first Supported by row.',
  clinical: 'Clinic credibility logos shown in the clinical partners row.',
}

export function groupPartnerLogosByCategory(
  logos: readonly PartnerLogoListItem[],
): PartnerLogoCategoryLists {
  const grouped: PartnerLogoCategoryLists = {
    strategic: [],
    clinical: [],
  }

  for (const logo of logos) {
    grouped[logo.category].push(logo)
  }

  for (const category of PARTNER_LOGO_CATEGORIES) {
    grouped[category].sort((left, right) => left.sortOrder - right.sortOrder)
  }

  return grouped
}
