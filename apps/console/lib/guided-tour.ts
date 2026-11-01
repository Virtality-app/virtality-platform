/**
 * Guided tours for the Getting started missions. A mission link adds
 * `?tour=<id>` to its page; the overlay then highlights one element at a time,
 * found by its `data-tour` attribute, and explains what to write or press.
 */

export const TOUR_PARAM = 'tour'
/** Optional: the `target` of the step to start at instead of the first. */
export const TOUR_STEP_PARAM = 'tourStep'

export type TourId = 'device' | 'patient' | 'program' | 'session'

export type TourStep = {
  /**
   * Value of the `data-tour` attribute on the highlighted element. Also keys
   * the step's copy: `tour.<tourId>.steps.<target>` in the `layout` namespace.
   */
  target: string
  /**
   * `click`: the step is done when the clinician clicks inside the target, or
   * only on elements inside it that match `selector`.
   * `next`: for typing or choosing; the card shows a Next button.
   */
  advance: { on: 'click'; selector?: string } | { on: 'next' }
  /** A branch step: skipped when its target is not on screen. */
  optional?: boolean
  /**
   * `beside`: the card sits next to the target instead of below it, for
   * targets that open a list underneath (a Select).
   */
  placement?: CardPlacement
  /**
   * Which element to highlight when several carry the target: `last` for a
   * list the clinician just added to, so the step points at the new item.
   */
  match?: 'first' | 'last'
}

export type CardPlacement = 'below' | 'beside'

/** Each tour's title is `tour.<tourId>.title` in the `layout` namespace. */
export type Tour = {
  /** The page the tour runs on; leaving it ends the tour. */
  path: string
  steps: TourStep[]
}

export const TOURS: Record<TourId, Tour> = {
  device: {
    path: '/devices',
    steps: [
      {
        target: 'device-add',
        advance: { on: 'click' },
      },
      {
        target: 'device-name',
        advance: { on: 'next' },
      },
      {
        target: 'device-submit',
        advance: { on: 'click' },
      },
      {
        target: 'device-pair',
        match: 'last',
        advance: { on: 'click' },
      },
      {
        target: 'device-code',
        advance: { on: 'next' },
      },
    ],
  },
  patient: {
    path: '/patients/new',
    steps: [
      {
        target: 'patient-name',
        advance: { on: 'next' },
      },
      {
        target: 'patient-sex',
        advance: { on: 'next' },
        placement: 'beside',
      },
      {
        target: 'patient-language',
        advance: { on: 'next' },
        placement: 'beside',
      },
      {
        target: 'patient-submit',
        advance: { on: 'click' },
      },
    ],
  },
  program: {
    path: '/programs/new',
    steps: [
      {
        target: 'program-choice',
        advance: { on: 'click', selector: 'button' },
      },
      {
        target: 'program-template-list',
        advance: { on: 'click', selector: '[cmdk-item]' },
        optional: true,
      },
      {
        target: 'program-template-continue',
        advance: { on: 'click' },
        optional: true,
      },
      {
        target: 'exercise-filters',
        advance: { on: 'click', selector: 'button' },
        optional: true,
      },
      {
        target: 'exercise-card',
        advance: { on: 'click' },
        optional: true,
      },
      {
        target: 'program-catalog-continue',
        advance: { on: 'click' },
        optional: true,
      },
      {
        target: 'program-name',
        advance: { on: 'next' },
      },
      {
        target: 'exercise-row',
        advance: { on: 'next' },
        optional: true,
      },
      {
        target: 'program-submit',
        advance: { on: 'click' },
      },
    ],
  },
  session: {
    path: '/',
    steps: [
      {
        target: 'session-patient',
        advance: { on: 'click', selector: '[role="option"]' },
      },
      {
        target: 'session-program',
        advance: { on: 'click', selector: '[role="option"]' },
      },
      {
        target: 'session-headset',
        advance: { on: 'click', selector: '[role="option"]' },
      },
      {
        target: 'session-launch',
        advance: { on: 'click' },
      },
    ],
  },
}

export function isTourId(value: string | null): value is TourId {
  return value !== null && Object.hasOwn(TOURS, value)
}

/**
 * A link that starts the tour on arrival, from the step whose target is
 * `from` when given.
 */
export function tourHref(id: TourId, from?: string): string {
  const params = new URLSearchParams({ [TOUR_PARAM]: id })
  if (from) params.set(TOUR_STEP_PARAM, from)
  return `${TOURS[id].path}?${params}`
}

/** The step a tour starts at: the one targeting `from`, or the first. */
export function tourStartIndex(id: TourId, from: string | null): number {
  if (!from) return 0
  return Math.max(
    TOURS[id].steps.findIndex((step) => step.target === from),
    0,
  )
}

export type ActiveTourStep = {
  index: number
  /** False while the step's element has not appeared yet. */
  present: boolean
}

/**
 * Which step to show from `index` on. Optional steps whose element is not on
 * screen are skipped, so the tour follows whichever branch the clinician took;
 * a required step waits for its element.
 */
export function resolveActiveStep(
  steps: TourStep[],
  index: number,
  isPresent: (target: string) => boolean,
): ActiveTourStep | null {
  for (let i = index; i < steps.length; i++) {
    const step = steps[i]!
    if (isPresent(step.target)) return { index: i, present: true }
    if (!step.optional) return { index: i, present: false }
  }
  return null
}

export type Rect = { top: number; left: number; width: number; height: number }

const GAP = 12
const MARGIN = 16

/**
 * Places the coach card below the target, or above it when there is no room.
 * `beside` puts it to the right of the target, or the left, so a list opening
 * under the target stays clear; with no room on either side it goes above.
 */
export function coachCardPosition(
  target: Rect,
  card: { width: number; height: number },
  viewport: { width: number; height: number },
  placement: CardPlacement = 'below',
): { top: number; left: number } {
  const clampTop = (top: number) =>
    Math.max(MARGIN, Math.min(top, viewport.height - card.height - MARGIN))
  const maxLeft = viewport.width - card.width - MARGIN
  const clampLeft = (left: number) => Math.max(MARGIN, Math.min(left, maxLeft))

  const below = target.top + target.height + GAP
  const above = target.top - GAP - card.height

  if (placement === 'beside') {
    const right = target.left + target.width + GAP
    const left = target.left - GAP - card.width
    if (right <= maxLeft) return { top: clampTop(target.top), left: right }
    if (left >= MARGIN) return { top: clampTop(target.top), left }
    if (above >= MARGIN) return { top: above, left: clampLeft(target.left) }
  }

  const top =
    below + card.height <= viewport.height - MARGIN || above < MARGIN
      ? below
      : above
  return { top: clampTop(top), left: clampLeft(target.left) }
}
