import { describe, expect, it } from 'vitest'
import {
  coachCardPosition,
  isTourId,
  resolveActiveStep,
  tourHref,
  TOURS,
  type TourStep,
} from './guided-tour'

const step = (target: string, optional = false): TourStep => ({
  target,
  title: target,
  body: '',
  advance: { on: 'click' },
  optional,
})

const onScreen =
  (...targets: string[]) =>
  (target: string) =>
    targets.includes(target)

describe('resolveActiveStep', () => {
  const steps = [
    step('choice'),
    step('template', true),
    step('catalog', true),
    step('name'),
  ]

  it('shows the step at the index when its element is there', () => {
    expect(resolveActiveStep(steps, 0, onScreen('choice', 'name'))).toEqual({
      index: 0,
      present: true,
    })
  })

  it('skips branch steps the clinician did not take', () => {
    expect(resolveActiveStep(steps, 1, onScreen('catalog'))).toEqual({
      index: 2,
      present: true,
    })
  })

  it('waits on a required step whose element has not appeared', () => {
    expect(resolveActiveStep(steps, 1, onScreen())).toEqual({
      index: 3,
      present: false,
    })
  })

  it('does not jump past a required step to a later one on screen', () => {
    expect(resolveActiveStep(steps, 0, onScreen('name'))).toEqual({
      index: 0,
      present: false,
    })
  })

  it('is done when only skipped branch steps remain', () => {
    const branches = [step('a'), step('b', true)]
    expect(resolveActiveStep(branches, 1, onScreen())).toBeNull()
    expect(resolveActiveStep(branches, 2, onScreen('a', 'b'))).toBeNull()
  })
})

describe('coachCardPosition', () => {
  const card = { width: 320, height: 150 }
  const viewport = { width: 1280, height: 800 }

  it('sits below the target when there is room', () => {
    expect(
      coachCardPosition(
        { top: 100, left: 200, width: 120, height: 40 },
        card,
        viewport,
      ),
    ).toEqual({ top: 152, left: 200 })
  })

  it('flips above a target near the bottom of the screen', () => {
    expect(
      coachCardPosition(
        { top: 700, left: 200, width: 120, height: 40 },
        card,
        viewport,
      ),
    ).toEqual({ top: 538, left: 200 })
  })

  it('keeps the card inside the screen next to a right-edge target', () => {
    expect(
      coachCardPosition(
        { top: 100, left: 1200, width: 60, height: 40 },
        card,
        viewport,
      ).left,
    ).toBe(944)
  })
})

describe('tour links', () => {
  it('opens each tour on its own page', () => {
    expect(tourHref('patient')).toBe('/patients/new?tour=patient')
    expect(tourHref('session')).toBe('/?tour=session')
  })

  it('only accepts known tours', () => {
    expect(isTourId('device')).toBe(true)
    expect(isTourId('toString')).toBe(false)
    expect(isTourId(null)).toBe(false)
  })

  it('ends every tour on a required step', () => {
    for (const tour of Object.values(TOURS)) {
      expect(tour.steps.at(-1)?.optional).toBeFalsy()
    }
  })
})
