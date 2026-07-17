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

export const DEFAULT_PARTNER_LOGO_CATEGORY = PARTNER_LOGO_CATEGORIES[0]

const PARTNER_LOGO_CATEGORY_SET = new Set<string>(PARTNER_LOGO_CATEGORIES)

export function isPartnerLogoCategory(
  value: string,
): value is PartnerLogoCategory {
  return PARTNER_LOGO_CATEGORY_SET.has(value)
}

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

export const PARTNER_LOGO_UPLOAD_BASE_PREFIX = 'marketing/logos'

export function getPartnerLogoUploadPrefix(
  category: PartnerLogoCategory,
): string {
  return `${PARTNER_LOGO_UPLOAD_BASE_PREFIX}/${category}`
}

export function groupPartnerLogosByCategory(
  logos: readonly PartnerLogoListItem[],
): PartnerLogoCategoryLists {
  const grouped = Object.fromEntries(
    PARTNER_LOGO_CATEGORIES.map((category) => [
      category,
      [] as PartnerLogoListItem[],
    ]),
  ) as PartnerLogoCategoryLists

  for (const logo of logos) {
    grouped[logo.category].push(logo)
  }

  for (const category of PARTNER_LOGO_CATEGORIES) {
    grouped[category].sort((left, right) => left.sortOrder - right.sortOrder)
  }

  return grouped
}
