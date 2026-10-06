/**
 * Guided tours for the Getting started missions. A mission link adds
 * `?tour=<id>` to its page; the overlay then highlights one element at a time,
 * found by its `data-tour` attribute, and explains what to write or press.
 */

export const TOUR_PARAM = 'tour'

export type TourId = 'device' | 'patient' | 'program' | 'session'

export type TourStep = {
  /** Value of the `data-tour` attribute on the highlighted element. */
  target: string
  title: string
  body: string
  /**
   * `click`: the step is done when the clinician clicks inside the target, or
   * only on elements inside it that match `selector`.
   * `next`: for typing or choosing; the card shows a Next button.
   */
  advance: { on: 'click'; selector?: string } | { on: 'next' }
  /** A branch step: skipped when its target is not on screen. */
  optional?: boolean
}

export type Tour = {
  /** Shown above each step's title. */
  title: string
  /** The page the tour runs on; leaving it ends the tour. */
  path: string
  steps: TourStep[]
}

export const TOURS: Record<TourId, Tour> = {
  device: {
    title: 'Pair a headset',
    path: '/devices',
    steps: [
      {
        target: 'device-add',
        title: 'Add your headset',
        body: 'Click Add device to register the headset you will use with patients.',
        advance: { on: 'click' },
      },
      {
        target: 'device-form',
        title: 'Name it',
        body: 'Give the headset a name you will recognise, like "Room 1", then press Add Device.',
        advance: { on: 'click', selector: 'button[type="submit"]' },
      },
      {
        target: 'device-pair',
        title: 'Start pairing',
        body: 'Press Pair to get a 6-digit code for the headset.',
        advance: { on: 'click' },
      },
      {
        target: 'device-code',
        title: 'Enter the code in the headset',
        body: 'Put the headset on and enter this code. The card shows Paired once it matches.',
        advance: { on: 'next' },
      },
    ],
  },
  patient: {
    title: 'Add your first patient',
    path: '/patients/new',
    steps: [
      {
        target: 'patient-name',
        title: 'Write the full name',
        body: 'Type the patient’s full name here. It is how you will find them later.',
        advance: { on: 'next' },
      },
      {
        target: 'patient-sex',
        title: 'Pick their sex',
        body: 'Choose an option from this list.',
        advance: { on: 'next' },
      },
      {
        target: 'patient-language',
        title: 'Pick their language',
        body: 'The headset speaks to the patient in this language.',
        advance: { on: 'next' },
      },
      {
        target: 'patient-submit',
        title: 'Save the patient',
        body: 'Everything else is optional. Press Create to add the patient.',
        advance: { on: 'click' },
      },
    ],
  },
  program: {
    title: 'Create an exercise program',
    path: '/programs/new',
    steps: [
      {
        target: 'program-choice',
        title: 'Choose how to start',
        body: 'A starter template is quickest. You can also pick exercises yourself.',
        advance: { on: 'click', selector: 'button' },
      },
      {
        target: 'program-template-list',
        title: 'Pick a template',
        body: 'Click a template to preview its exercises on the right.',
        advance: { on: 'click', selector: '[cmdk-item]' },
        optional: true,
      },
      {
        target: 'program-template-continue',
        title: 'Open it in the editor',
        body: 'Press Continue to editor. Nothing is saved yet.',
        advance: { on: 'click' },
        optional: true,
      },
      {
        target: 'program-catalog-continue',
        title: 'Pick exercises',
        body: 'Select the exercises you want from the catalog, then press this button.',
        advance: { on: 'click' },
        optional: true,
      },
      {
        target: 'program-name',
        title: 'Name the program',
        body: 'Write a name you will recognise when starting a session, like "Knee rehab week 1".',
        advance: { on: 'next' },
      },
      {
        target: 'program-submit',
        title: 'Save it to your library',
        body: 'Press Submit. The program is ready to use in any session.',
        advance: { on: 'click' },
      },
    ],
  },
  session: {
    title: 'Start a session',
    path: '/',
    steps: [
      {
        target: 'session-patient',
        title: 'Pick a patient',
        body: 'Click the patient you are treating.',
        advance: { on: 'click', selector: '[role="option"]' },
      },
      {
        target: 'session-program',
        title: 'Pick a program',
        body: 'Choose one of your programs, or Quick Start to pick exercises on the fly.',
        advance: { on: 'click', selector: '[role="option"]' },
      },
      {
        target: 'session-headset',
        title: 'Pick the headset',
        body: 'Put the headset on the patient and choose it here.',
        advance: { on: 'click', selector: '[role="option"]' },
      },
      {
        target: 'session-launch',
        title: 'Launch',
        body: 'Press Launch on headset. The session opens on the patient dashboard.',
        advance: { on: 'click' },
      },
    ],
  },
}

export function isTourId(value: string | null): value is TourId {
  return value !== null && Object.hasOwn(TOURS, value)
}

/** A mission page link that starts its tour on arrival. */
export function tourHref(id: TourId): string {
  return `${TOURS[id].path}?${TOUR_PARAM}=${id}`
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

/** Places the coach card below the target, or above it when there is no room. */
export function coachCardPosition(
  target: Rect,
  card: { width: number; height: number },
  viewport: { width: number; height: number },
): { top: number; left: number } {
  const below = target.top + target.height + GAP
  const above = target.top - GAP - card.height
  const top =
    below + card.height <= viewport.height - MARGIN || above < MARGIN
      ? below
      : above
  const maxLeft = viewport.width - card.width - MARGIN
  const left = Math.max(MARGIN, Math.min(target.left, maxLeft))
  return {
    top: Math.max(
      MARGIN,
      Math.min(top, viewport.height - card.height - MARGIN),
    ),
    left,
  }
}
