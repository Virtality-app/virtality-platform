'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { MousePointerClick } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import { cn } from '@/lib/utils'
import { coachCardPosition, type Rect, type TourStep } from '@/lib/guided-tour'

// Stops a dialog under the tour from treating clicks on this card as clicks outside it.
const SHIELDED_EVENTS = ['pointerdown', 'mousedown', 'touchstart', 'focusin']

// A clinician still on the same click step after this long gets a nudge.
const HINT_DELAY_MS = 10_000

/**
 * Explains the current step next to the highlighted element. While the
 * element has not appeared yet it waits in the bottom-right corner.
 */
const TourCoachCard = ({
  tourTitle,
  step,
  isLast,
  rect,
  onNext,
  onEnd,
}: {
  tourTitle: string
  step: TourStep
  isLast: boolean
  rect: Rect | null
  onNext: () => void
  onEnd: () => void
}) => {
  const ref = useRef<HTMLElement>(null)
  const [size, setSize] = useState({ width: 320, height: 160 })
  const [hintFor, setHintFor] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setHintFor(step.target), HINT_DELAY_MS)
    return () => clearTimeout(timer)
  }, [step.target])

  const showHint = hintFor === step.target

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const { width, height } = el.getBoundingClientRect()
      setSize({ width, height })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)

    const stop = (event: Event) => event.stopPropagation()
    for (const name of SHIELDED_EVENTS) el.addEventListener(name, stop)
    return () => {
      observer.disconnect()
      for (const name of SHIELDED_EVENTS) el.removeEventListener(name, stop)
    }
  }, [])

  const position = rect
    ? coachCardPosition(rect, size, {
        width: window.innerWidth,
        height: window.innerHeight,
      })
    : undefined

  return (
    <aside
      ref={ref}
      aria-label='Guided tour'
      aria-live='polite'
      style={position}
      className={cn(
        'bg-popover text-popover-foreground pointer-events-auto fixed z-60 w-80 max-w-[calc(100vw-2rem)] rounded-xl border p-4 shadow-lg transition-[top,left] duration-200',
        !position && 'right-4 bottom-4',
      )}
    >
      <p className='text-vital-blue-700 dark:text-vital-blue-400 text-xs font-medium'>
        {tourTitle}
      </p>
      <p className='mt-1 font-semibold'>{step.title}</p>
      <p className='text-muted-foreground mt-1 text-sm'>{step.body}</p>
      <div className='mt-3 flex items-center justify-between gap-2'>
        <Button variant='ghost' size='sm' onClick={onEnd}>
          End tour
        </Button>
        {step.advance.on === 'next' ? (
          <Button variant='primary' size='sm' onClick={onNext}>
            {isLast ? 'Done' : 'Next'}
          </Button>
        ) : !rect ? (
          <span className='text-muted-foreground text-xs'>Waiting…</span>
        ) : showHint ? (
          <span className='text-muted-foreground animate-in fade-in flex items-center gap-1.5 text-xs'>
            <MousePointerClick className='size-4' />
            Click the highlight
          </span>
        ) : null}
      </div>
    </aside>
  )
}

export default TourCoachCard
