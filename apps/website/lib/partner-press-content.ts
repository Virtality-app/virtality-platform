export type CredibilitySectionContent = {
  eyebrow: string
  titleLead: string
  titleAccent: string
  intro: string
}

export type CredibilityLogoItem = {
  src: string
  alt: string
  className?: string
  wide?: boolean
  compact?: boolean
}

export type PressLogoItem = CredibilityLogoItem & {
  href?: string
}

export const SUPPORTED_BY_CONTENT = {
  eyebrow: 'Strategic Partnership',
  titleLead: 'Supported',
  titleAccent: 'By',
  intro:
    'Our innovation is backed by leading institutions and clinics committed to advancing healthcare technology',
  clinicalPartnersLabel: 'Clinical Partners',
} as const

export const PRESS_SECTION_CONTENT = {
  eyebrow: 'In the media',
  titleLead: 'Press',
  titleAccent: 'coverage',
  intro:
    "Coverage and features from publications following Virtality's work in evidence-based VR therapy.",
} as const

export const STRATEGIC_PARTNER_LOGOS: CredibilityLogoItem[] = []

export const CLINICAL_PARTNER_LOGOS: CredibilityLogoItem[] = []

export const PRESS_LOGO_ITEMS: PressLogoItem[] = []
