'use client'

import { useEffect, useState } from 'react'
import {
  resolveActiveStep,
  type ActiveTourStep,
  type Rect,
  type TourStep,
} from '@/lib/guided-tour'

/** The visible element tagged `data-tour="<target>"`, if any. */
export function findTourTarget(target: string): HTMLElement | null {
  const matches = document.querySelectorAll<HTMLElement>(
    `[data-tour="${target}"]`,
  )
  for (const el of matches) {
    if (el.getClientRects().length > 0) return el
  }
  return null
}

export type TourTarget = {
  /** Null once no step is left to show. */
  active: ActiveTourStep | null
  /** Where the active step's element is; null while it has not appeared. */
  rect: Rect | null
}

/**
 * Follows the page every frame: elements appear after dialogs open, requests
 * finish, or the clinician scrolls, and the highlight has to keep up.
 */
export function useTourTarget(
  steps: TourStep[] | null,
  index: number,
): TourTarget | undefined {
  const [target, setTarget] = useState<TourTarget | undefined>(undefined)

  useEffect(() => {
    if (!steps) {
      setTarget(undefined)
      return
    }

    let frame = 0
    let last = ''
    let scrolledTo = -1

    const tick = () => {
      const active = resolveActiveStep(
        steps,
        index,
        (t) => findTourTarget(t) !== null,
      )
      const el = active?.present
        ? findTourTarget(steps[active.index]!.target)
        : null

      if (el && active && active.index !== scrolledTo) {
        scrolledTo = active.index
        el.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }

      const box = el?.getBoundingClientRect()
      const next: TourTarget = {
        active,
        rect: box
          ? {
              top: box.top,
              left: box.left,
              width: box.width,
              height: box.height,
            }
          : null,
      }
      const key = JSON.stringify(next)
      if (key !== last) {
        last = key
        setTarget(next)
      }
      frame = requestAnimationFrame(tick)
    }

    tick()
    return () => cancelAnimationFrame(frame)
  }, [steps, index])

  return target
}
