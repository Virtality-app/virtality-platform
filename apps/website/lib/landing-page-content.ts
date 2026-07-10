export type LandingBenefit = {
  title: string
  description: string
}

export const LANDING_BENEFITS: LandingBenefit[] = [
  {
    title: 'Help patients follow guided movement again',
    description:
      'Patients who resist or avoid exercise can start participating in clinician-guided VR sessions instead of sitting out.',
  },
  {
    title: 'Support fearful and guarded movement patterns',
    description:
      'Virtality can support patients facing kinesiophobia, chronic pain, fibromyalgia, and tendinopathy by reducing fear and improving guided movement—without claiming to treat those conditions directly.',
  },
  {
    title: 'Free you to see more patients in the same hour',
    description:
      'A patient can continue a guided VR session while you step away to assess or treat someone else.',
  },
  {
    title: 'Keep patients engaged between hands-on visits',
    description:
      'When motivation drops mid-program, immersive guided exercises help patients stay with their plan between appointments.',
  },
  {
    title: 'Ground decisions in session-level insight',
    description:
      'Progress from each session gives physiotherapists concrete signals to adjust guided movement before the next visit.',
  },
  {
    title: 'Built for private clinic realities',
    description:
      'From lead physiotherapists to clinic owners, Virtality fits workflows where time, staffing, and throughput shape every treatment decision.',
  },
]

export type PilotProofHighlight = {
  title: string
  description: string
}

export const PILOT_PROOF_CONTENT = {
  eyebrow: 'Pilot data',
  title: 'Early signals from guided VR sessions',
  intro:
    'Virtality is still in early pilot use with private clinics. The stories below come from that pilot work—not promises that every patient will recover on the same timeline.',
  highlights: [
    {
      title: 'Days, not months',
      description:
        'In early pilot clinics, physiotherapists observed meaningful movement progress over days, not months, when patients followed guided VR sessions consistently.',
    },
    {
      title: '2 targeted sessions',
      description:
        'In pilot data, two targeted guided sessions helped patients move past initial fear and return to prescribed movement—enough to keep rehab moving forward.',
    },
  ] satisfies PilotProofHighlight[],
  disclaimer:
    'Pilot observations from a small cohort. Individual results vary and Virtality does not promise specific clinical outcomes.',
}

export const LANDING_PAGE_FORBIDDEN_CLAIMS = [
  /50.?95%/i,
  /\+87%/i,
  /Recovery Rate/i,
] as const
