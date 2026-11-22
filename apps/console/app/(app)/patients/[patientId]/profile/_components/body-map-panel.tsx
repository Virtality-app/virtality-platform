import type { ReactNode } from 'react'

/**
 * One labelled body map. The map fills its column up to 18rem and never
 * grows past ~62% of the screen height, so it stays whole on a landscape
 * iPad. Taps toggle right away: no tap flash, no double-tap zoom delay.
 */
const BodyMapPanel = ({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) => (
  <div className='flex w-full max-w-72 min-w-0 touch-manipulation flex-col items-center gap-2 justify-self-center [-webkit-tap-highlight-color:transparent] [&_svg]:h-auto [&_svg]:max-h-[62svh] [&_svg]:w-full'>
    <span className='text-[11.5px] font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400'>
      {label}
    </span>
    {children}
  </div>
)

export default BodyMapPanel
