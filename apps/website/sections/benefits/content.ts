export const BENEFITS_SECTION_CONTENT = {
  eyebrow: 'Why clinics choose Virtality',
  titleLead: 'Smarter therapy,',
  titleAccent: 'better results.',
  intro:
    'Built for private clinic owners and lead physiotherapists who need patients moving again without adding operational friction.',
} as const

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
