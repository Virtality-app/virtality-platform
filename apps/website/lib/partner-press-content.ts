export type CredibilitySectionContent = {
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
  titleLead: 'Supported',
  titleAccent: 'By',
  intro:
    'Our innovation is backed by leading institutions and clinics committed to advancing healthcare technology',
  strategicPartnersLabel: 'Strategic Partnership',
  clinicalPartnersLabel: 'Clinical Partners',
} as const

export const PRESS_SECTION_CONTENT = {
  titleLead: 'Press',
  titleAccent: 'coverage',
  intro:
    "Coverage and features from publications following Virtality's work in evidence-based VR therapy.",
} as const

export const PRESS_LOGO_ITEMS: PressLogoItem[] = [
  {
    src: '/press/kathimerini-logo.png',
    alt: 'Kathimerini',
  },
  {
    src: '/press/anatolh-logo.png',
    alt: 'Anatolh',
  },
  {
    src: '/press/startupper-logo.png',
    alt: 'Startupper',
  },
  {
    src: '/press/beyondexpo-logo.png',
    alt: 'Beyond Expo',
  },
  {
    src: '/press/bizrupt-logo.png',
    alt: 'Bizrupt',
  },
  {
    src: '/press/delphi-logo.png',
    alt: 'Delphi Economic Forum',
  },
  {
    src: '/press/ionian-logo.png',
    alt: 'Ionian',
  },
  {
    src: '/press/ena-channel-kavala-logo.png',
    alt: 'Ena Channel Kavala',
  },
]
