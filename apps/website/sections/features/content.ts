export const SETUP_CAPABILITY_TITLE = 'Quick setup, equipment included'

export const SETUP_CAPABILITY_CONTENT =
  'Get started in under 40 seconds with no extra cameras, sensors, cables, or calibration. Equipment is provided so your clinic can begin guided VR sessions without sourcing hardware.'

export const features: Array<{
  title: string
  context: string
  icon?: keyof typeof import('lucide-react')
}> = [
  {
    title: 'Real-time Biofeedback',
    context:
      'Monitor patient progress in real time, visualize movement patterns, identify areas of improvement, and adapt therapy plans based on measurable performance insights.',
    icon: 'Activity',
  },
  {
    title: 'Neuroplasticity Exercises',
    context:
      'Specialized VR environments designed to stimulate neural pathways, accelerate recovery, and optimize outcomes through targeted exercises.',
    icon: 'Brain',
  },
  {
    title: SETUP_CAPABILITY_TITLE,
    context: SETUP_CAPABILITY_CONTENT,
    icon: 'Package',
  },
  {
    title: 'Progress Analytics',
    context:
      'Built-in analytics track key recovery metrics and generate clear, actionable reports to support decision-making.',
    icon: 'BarChartBig',
  },
  {
    title: 'Customizable Therapy',
    context:
      'Create personalized treatment plans with flexible, inclusive tools that adapt to each patient’s individual needs.',
    icon: 'Sliders',
  },
  {
    title: 'Engagement Tracking',

    context:
      'Monitor patient engagement and adherence to prescribed exercises to ensure optimal therapeutic outcomes.',
    icon: 'Clock',
  },
]
