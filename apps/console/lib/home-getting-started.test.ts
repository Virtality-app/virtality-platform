import { describe, expect, it } from 'vitest'
import { createCatalogTranslate } from '@/i18n/catalog-translate'
import {
  buildGettingStarted,
  gettingStartedHeadline,
  gettingStartedSubline,
} from './home-getting-started'

const t = createCatalogTranslate('home')

describe('buildGettingStarted', () => {
  it('marks nothing done for a fresh account and points at pairing', () => {
    const result = buildGettingStarted(
      {
        deviceCount: 0,
        pairedDeviceCount: 0,
        patientCount: 0,
        programCount: 0,
        sessionCount: 0,
      },
      t,
    )

    expect(result.doneCount).toBe(0)
    expect(result.complete).toBe(false)
    expect(result.steps.map((s) => s.current)).toEqual([
      true,
      false,
      false,
      false,
    ])
    expect(gettingStartedHeadline(result, t)).toBe(
      '4 steps left before your first session.',
    )
    expect(gettingStartedSubline(result, t)).toBe(
      'Once these are done this card collapses to a summary.',
    )
  })

  it('needs a paired headset, not just an added one', () => {
    const result = buildGettingStarted(
      {
        deviceCount: 1,
        pairedDeviceCount: 0,
        patientCount: 1,
        programCount: 0,
        sessionCount: 0,
      },
      t,
    )

    expect(result.steps[0]).toMatchObject({
      done: false,
      current: true,
      detail: 'A headset is added but not paired yet.',
    })
    expect(result.steps[1]?.done).toBe(true)
    expect(result.doneCount).toBe(1)
  })

  it('resumes the device tour at Pair when a headset is added but not paired', () => {
    const base = {
      patientCount: 0,
      programCount: 0,
      sessionCount: 0,
    }
    const unpaired = buildGettingStarted(
      {
        ...base,
        deviceCount: 1,
        pairedDeviceCount: 0,
      },
      t,
    )
    const fresh = buildGettingStarted(
      {
        ...base,
        deviceCount: 0,
        pairedDeviceCount: 0,
      },
      t,
    )

    expect(unpaired.steps[0]?.href).toContain('tourStep=device-pair')
    expect(fresh.steps[0]?.href).toContain('tour=device')
    expect(fresh.steps[0]?.href).not.toContain('tourStep')
  })

  it('makes the first open step current even when later ones are done', () => {
    const result = buildGettingStarted(
      {
        deviceCount: 1,
        pairedDeviceCount: 1,
        patientCount: 1,
        programCount: 0,
        sessionCount: 0,
      },
      t,
    )

    expect(result.steps.map((s) => s.current)).toEqual([
      false,
      false,
      true,
      false,
    ])
    expect(gettingStartedHeadline(result, t)).toBe(
      '2 steps left before your first session.',
    )
  })

  it('completes once a session has run', () => {
    const result = buildGettingStarted(
      {
        deviceCount: 2,
        pairedDeviceCount: 2,
        patientCount: 3,
        programCount: 2,
        sessionCount: 1,
      },
      t,
    )

    expect(result.complete).toBe(true)
    expect(result.steps.every((s) => !s.current)).toBe(true)
    expect(result.steps[0]?.detail).toBe('2 headsets paired')
    expect(gettingStartedHeadline(result, t)).toBe('You are all set.')
    expect(result.steps.map((s) => s.href)).toEqual([
      '/devices?tour=device&returnTo=%2F',
      '/patients/new?tour=patient&returnTo=%2F',
      '/programs/new?tour=program&returnTo=%2F',
      '/?tour=session',
    ])
    expect(gettingStartedSubline(result, t)).toBe(
      'Every step is done. Expand it any time to revisit them.',
    )
  })
})
