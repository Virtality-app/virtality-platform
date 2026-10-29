import type { Translate } from '@/i18n/translate'
import { tourHref } from './guided-tour'
import { withReturnTo } from './home-picker-return'

/** Id of the Start a session card, so it can be linked to with a hash. */
export const START_SESSION_ANCHOR = 'start-session'

export type GettingStartedInput = {
  deviceCount: number
  pairedDeviceCount: number
  patientCount: number
  programCount: number
  sessionCount: number
}

export type GettingStartedStepId = 'device' | 'patient' | 'program' | 'session'

export type GettingStartedStep = {
  id: GettingStartedStepId
  title: string
  /** What to show under the title; changes once the step is done. */
  detail: string
  done: boolean
  /** The first step that is not done. */
  current: boolean
  /** Runs the step's tour; a done step's tour adds another one. */
  href: string
}

export type GettingStarted = {
  steps: GettingStartedStep[]
  doneCount: number
  /** Every step is done: the card stays, collapsed to its summary. */
  complete: boolean
}

/** Opens the step's page with its tour, and comes back here once it is done. */
function missionHref(
  id: 'device' | 'patient' | 'program',
  from?: string,
): string {
  return withReturnTo(tourHref(id, from), '/')
}

/** The device tour's Pair step: where a headset added on an earlier run resumes. */
const DEVICE_PAIR_STEP = 'device-pair'

export function buildGettingStarted(
  input: GettingStartedInput,
  t: Translate,
): GettingStarted {
  const hasPaired = input.pairedDeviceCount > 0
  const hasUnpaired = input.deviceCount > input.pairedDeviceCount
  const hasPatient = input.patientCount > 0
  const hasProgram = input.programCount > 0
  const hasSession = input.sessionCount > 0

  const steps: Omit<GettingStartedStep, 'current'>[] = [
    {
      id: 'device',
      title: t('gettingStarted.device.title'),
      detail: hasPaired
        ? t('gettingStarted.device.paired', { count: input.pairedDeviceCount })
        : input.deviceCount > 0
          ? t('gettingStarted.device.unpaired')
          : t('gettingStarted.device.empty'),
      done: hasPaired,
      href: missionHref('device', hasUnpaired ? DEVICE_PAIR_STEP : undefined),
    },
    {
      id: 'patient',
      title: t('gettingStarted.patient.title'),
      detail: hasPatient
        ? t('gettingStarted.patient.onFile', { count: input.patientCount })
        : t('gettingStarted.patient.empty'),
      done: hasPatient,
      href: missionHref('patient'),
    },
    {
      id: 'program',
      title: t('gettingStarted.program.title'),
      detail: hasProgram
        ? t('gettingStarted.program.inLibrary', { count: input.programCount })
        : t('gettingStarted.program.empty'),
      done: hasProgram,
      href: missionHref('program'),
    },
    {
      id: 'session',
      title: t('gettingStarted.session.title'),
      detail: hasSession
        ? t('gettingStarted.session.done')
        : t('gettingStarted.session.empty'),
      done: hasSession,
      href: tourHref('session'),
    },
  ]

  const firstOpen = steps.findIndex((step) => !step.done)
  const doneCount = steps.filter((step) => step.done).length

  return {
    steps: steps.map((step, index) => ({
      ...step,
      current: index === firstOpen,
    })),
    doneCount,
    complete: firstOpen === -1,
  }
}

/** The line under the header; also the collapsed card's whole story. */
export function gettingStartedHeadline(
  gettingStarted: GettingStarted,
  t: Translate,
): string {
  const left = gettingStarted.steps.length - gettingStarted.doneCount
  if (left === 0) return t('gettingStarted.headline.allSet')
  return t('gettingStarted.headline.stepsLeft', { count: left })
}

/** Explains what the card does next, under the headline. */
export function gettingStartedSubline(
  gettingStarted: GettingStarted,
  t: Translate,
): string {
  return gettingStarted.complete
    ? t('gettingStarted.subline.complete')
    : t('gettingStarted.subline.pending')
}
