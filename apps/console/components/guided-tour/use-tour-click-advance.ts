'use client'

import { useEffect } from 'react'
import type { TourStep } from '@/lib/guided-tour'
import { findTourTarget } from './use-tour-target'

/**
 * Moves to the next step when the clinician clicks the highlighted element
 * (or the part of it the step names). Listens in the capture phase so the
 * click still counts when it navigates away or unmounts the element.
 */
export function useTourClickAdvance(
  step: TourStep | null,
  onAdvance: () => void,
) {
  useEffect(() => {
    if (!step || step.advance.on !== 'click') return
    const { selector } = step.advance

    const handleClick = (event: MouseEvent) => {
      const el = findTourTarget(step.target)
      const clicked = event.target
      if (!el || !(clicked instanceof Element) || !el.contains(clicked)) return
      if (selector) {
        const match = clicked.closest(selector)
        if (!match || !el.contains(match)) return
      }
      onAdvance()
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [step, onAdvance])
}
