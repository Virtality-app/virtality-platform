export type LandingContentItem = {
  title: string
  description: string
}

export type LandingBenefitIconName =
  | 'PersonStanding'
  | 'Shield'
  | 'Users'
  | 'Sparkles'
  | 'ClipboardList'
  | 'Building2'

export type LandingBenefit = LandingContentItem & {
  icon: LandingBenefitIconName
}

export const BENEFITS_SECTION_CONTENT = {
  eyebrow: 'Why clinics choose Virtality',
  titleLead: 'Practical problems',
  titleAccent: 'solved in clinic',
  intro:
    'Built for private clinic owners and lead physiotherapists who need patients moving again without adding operational friction.',
} as const

export const LANDING_BENEFITS: LandingBenefit[] = [
  {
    title: 'Help patients follow guided movement again',
    description:
      'Patients who resist or avoid exercise can start participating in clinician-guided VR sessions instead of sitting out.',
    icon: 'PersonStanding',
  },
  {
    title: 'Support fearful and guarded movement patterns',
    description:
      'Virtality can support patients facing kinesiophobia, chronic pain, fibromyalgia, and tendinopathy by reducing fear and improving guided movement—without claiming to treat those conditions directly.',
    icon: 'Shield',
  },
  {
    title: 'Free you to see more patients in the same hour',
    description:
      'A patient can continue a guided VR session while you step away to assess or treat someone else.',
    icon: 'Users',
  },
  {
    title: 'Keep patients engaged between hands-on visits',
    description:
      'When motivation drops mid-program, immersive guided exercises help patients stay with their plan between appointments.',
    icon: 'Sparkles',
  },
  {
    title: 'Ground decisions in session-level insight',
    description:
      'Progress from each session gives physiotherapists concrete signals to adjust guided movement before the next visit.',
    icon: 'ClipboardList',
  },
  {
    title: 'Built for private clinic realities',
    description:
      'From lead physiotherapists to clinic owners, Virtality fits workflows where time, staffing, and throughput shape every treatment decision.',
    icon: 'Building2',
  },
]

export type PilotProofMetric = {
  value: string
  label: string
  caption: string
}

export const PILOT_PROOF_CONTENT = {
  metrics: [
    {
      value: '70-97%',
      label: 'Faster Recovery Rate',
      caption: 'vs. traditional therapy',
    },
    {
      value: '97%',
      label: 'Patient Engagement',
      caption: 'sustained throughout treatment',
    },
    {
      value: '2.5x',
      label: 'Increased Efficiency',
      caption: 'more patients per session',
    },
  ] satisfies PilotProofMetric[],
}

export const SETUP_CAPABILITY_TITLE = 'Quick setup, equipment included'

export const SETUP_CAPABILITY_CONTENT =
  'Get started in under 40 seconds with no extra cameras, sensors, cables, or calibration. Equipment is provided so your clinic can begin guided VR sessions without sourcing hardware.'
