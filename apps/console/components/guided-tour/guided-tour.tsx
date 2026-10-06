'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useGuidedTour } from './use-guided-tour'
import { useTourTarget } from './use-tour-target'
import { useTourClickAdvance } from './use-tour-click-advance'
import TourSpotlight from './tour-spotlight'
import TourCoachCard from './tour-coach-card'

/** The Getting started walkthrough: highlights where to write or press next. */
const GuidedTour = () => {
  const { tour, index, goTo, end } = useGuidedTour()
  const target = useTourTarget(tour?.steps ?? null, index)
  const active = target?.active ?? null
  const step = tour && active ? tour.steps[active.index]! : null

  useTourClickAdvance(active?.present ? step : null, () => {
    if (active) goTo(active.index + 1)
  })

  // The remaining steps were all branches the clinician did not take.
  useEffect(() => {
    if (tour && target && !target.active) end()
  }, [tour, target, end])

  if (!tour || !active || !step) return null

  return createPortal(
    <>
      {target?.rect ? <TourSpotlight rect={target.rect} /> : null}
      <TourCoachCard
        tourTitle={tour.title}
        step={step}
        isLast={active.index === tour.steps.length - 1}
        rect={target?.rect ?? null}
        onNext={() => goTo(active.index + 1)}
        onEnd={end}
      />
    </>,
    document.body,
  )
}

export default GuidedTour
