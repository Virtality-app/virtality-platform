'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  isTourId,
  TOUR_PARAM,
  TOUR_STEP_PARAM,
  tourStartIndex,
  TOURS,
  type TourId,
} from '@/lib/guided-tour'

/**
 * Which tour is running and how far along it is. Arriving with `?tour=<id>`
 * starts that tour (at `&tourStep=<target>` when given); leaving its page
 * ends it.
 */
export function useGuidedTour() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [run, setRun] = useState<{ id: TourId; index: number } | null>(null)

  const requested = searchParams.get(TOUR_PARAM)

  useEffect(() => {
    if (!isTourId(requested)) return
    setRun({
      id: requested,
      index: tourStartIndex(requested, searchParams.get(TOUR_STEP_PARAM)),
    })

    // Drop the params so a reload or a shared link does not restart the tour.
    const rest = new URLSearchParams(searchParams)
    rest.delete(TOUR_PARAM)
    rest.delete(TOUR_STEP_PARAM)
    const query = rest.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [requested, searchParams, pathname, router])

  useEffect(() => {
    if (run && pathname !== TOURS[run.id].path) setRun(null)
  }, [run, pathname])

  const tour = run ? TOURS[run.id] : null

  const goTo = (index: number) => {
    if (!run || !tour) return
    setRun(index < tour.steps.length ? { ...run, index } : null)
  }

  return {
    tour,
    index: run?.index ?? 0,
    goTo,
    end: () => setRun(null),
  }
}
