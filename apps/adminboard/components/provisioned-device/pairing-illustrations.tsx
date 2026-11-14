/**
 * Small line drawings for the pairing help, one per step. A catalog of
 * SVGs, so several components share this file (docs/agents/ui-composition.md).
 * Each draws in currentColor on an 80×48 canvas.
 */

type IllustrationProps = { className?: string }

const svgProps = {
  viewBox: '0 0 80 48',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

/** A VR headset, front on, with its power light lit. */
export function HeadsetIllustration({ className }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <path d='M18 16h44a6 6 0 0 1 6 6v8a6 6 0 0 1-6 6H50l-4-5h-12l-4 5H18a6 6 0 0 1-6-6v-8a6 6 0 0 1 6-6Z' />
      <path d='M12 24H8M68 24h4' />
      <circle cx='60' cy='22' r='1.5' fill='currentColor' stroke='none' />
    </svg>
  )
}

/** The headset's view: a pairing screen with six empty boxes. */
export function PairingScreenIllustration({ className }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <rect x='10' y='8' width='60' height='32' rx='4' />
      <path d='M28 16h24' strokeWidth={1.5} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect
          key={i}
          x={19 + i * 7.5}
          y='24'
          width='5.5'
          height='8'
          rx='1'
          strokeWidth={1.5}
        />
      ))}
    </svg>
  )
}

/** The same boxes, filled in with a code. */
export function CodeIllustration({ className }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <rect x='10' y='8' width='60' height='32' rx='4' />
      {['4', '8', '1', '5', '2', '7'].map((digit, i) => (
        <text
          key={i}
          x={21.75 + i * 7.5}
          y='29'
          fill='currentColor'
          stroke='none'
          fontSize='9'
          fontFamily='ui-monospace, monospace'
          fontWeight='600'
          textAnchor='middle'
        >
          {digit}
        </text>
      ))}
      <path d='M19 33h43' strokeWidth={1} strokeDasharray='5.5 2' />
    </svg>
  )
}

/** The headset with a tick: paired. */
export function PairedIllustration({ className }: IllustrationProps) {
  return (
    <svg {...svgProps} className={className}>
      <path d='M14 18h36a5 5 0 0 1 5 5v6a5 5 0 0 1-5 5H41l-3-4h-12l-3 4h-9a5 5 0 0 1-5-5v-6a5 5 0 0 1 5-5Z' />
      <circle cx='62' cy='18' r='8' className='text-green-600' />
      <path d='m58.5 18 2.5 2.5 4.5-5' className='text-green-600' />
    </svg>
  )
}
