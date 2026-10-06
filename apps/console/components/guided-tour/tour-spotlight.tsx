import type { Rect } from '@/lib/guided-tour'

const PAD = 6
// Tailwind's pulse runs every 2 s, which reads as blinking on a bright outline.
const PULSE_DURATION = '4s'

/**
 * Dims the page around the highlighted element. The dim sits under dialogs
 * and menus so they stay readable; the ring sits above them so it shows
 * inside a dialog too, with a soft halo, and pulses slowly. Neither catches
 * clicks.
 */
const TourSpotlight = ({ rect }: { rect: Rect }) => {
  const box = {
    top: rect.top - PAD,
    left: rect.left - PAD,
    width: rect.width + PAD * 2,
    height: rect.height + PAD * 2,
  }

  return (
    <>
      <div
        aria-hidden
        style={box}
        className='pointer-events-none fixed z-40 rounded-lg shadow-[0_0_0_9999px_rgb(0_0_0/0.45)] transition-all duration-200'
      />
      <div
        aria-hidden
        style={{ ...box, animationDuration: PULSE_DURATION }}
        className='outline-vital-blue-500 pointer-events-none fixed z-60 animate-pulse rounded-lg shadow-[0_0_10px_2px_rgb(12_216_243/0.25)] outline-2 transition-all duration-200 motion-reduce:animate-none'
      />
    </>
  )
}

export default TourSpotlight
