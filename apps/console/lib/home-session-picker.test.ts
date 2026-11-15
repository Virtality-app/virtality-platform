import { describe, expect, it } from 'vitest'
import {
  clearRemovedHomePick,
  homeLaunchHref,
  isHeadsetSelectable,
  isHomePickerReady,
  QUICK_START_PROGRAM_ID,
  reconcileHomePickerSelection,
  summarizeHomePicker,
} from './home-session-picker'

describe('summarizeHomePicker', () => {
  it('lists chosen names and prompts for the first open step', () => {
    expect(
      summarizeHomePicker(
        { patientId: 'p1', programId: 'rp1', deviceId: null },
        { patientId: 'Maria', programId: 'Shoulder A' },
      ),
    ).toEqual({
      chosen: ['Maria', 'Shoulder A'],
      missing: 'choose a headset to continue',
    })
  })

  it('prompts for the patient first when nothing is chosen', () => {
    expect(
      summarizeHomePicker(
        { patientId: null, programId: 'rp1', deviceId: 'd1' },
        { programId: 'Shoulder A', deviceId: 'Room A' },
      ),
    ).toEqual({ chosen: ['Shoulder A', 'Room A'], missing: 'choose a patient' })
  })

  it('has nothing missing once every step is chosen', () => {
    expect(
      summarizeHomePicker(
        { patientId: 'p1', programId: 'rp1', deviceId: 'd1' },
        { patientId: 'Maria', programId: 'Shoulder A', deviceId: 'Room A' },
      ).missing,
    ).toBeNull()
  })
})

describe('launch', () => {
  it('is not ready until all three are chosen', () => {
    expect(
      isHomePickerReady({ patientId: 'p1', programId: 'rp1', deviceId: null }),
    ).toBe(false)
    expect(
      homeLaunchHref({ patientId: 'p1', programId: 'rp1', deviceId: null }),
    ).toBeNull()
  })

  it('opens the patient dashboard armed to launch, via Quick Start when picked', () => {
    expect(
      homeLaunchHref({ patientId: 'p1', programId: 'rp1', deviceId: 'd1' }),
    ).toBe('/patients/p1/patient-dashboard?launch=1')
    expect(
      homeLaunchHref({
        patientId: 'p1',
        programId: QUICK_START_PROGRAM_ID,
        deviceId: 'd1',
      }),
    ).toBe('/patients/p1/patient-dashboard?launch=1&quickstart=1')
  })
})

describe('isHeadsetSelectable', () => {
  it('allows online and still-checking headsets only', () => {
    expect(isHeadsetSelectable('online')).toBe(true)
    expect(isHeadsetSelectable('loading')).toBe(true)
    expect(isHeadsetSelectable('offline')).toBe(false)
    expect(isHeadsetSelectable('unpaired')).toBe(false)
  })
})

describe('reconcileHomePickerSelection', () => {
  it('drops a program or headset that no longer exists but keeps Quick Start', () => {
    expect(
      reconcileHomePickerSelection(
        { patientId: 'p1', programId: 'gone', deviceId: 'gone' },
        { programIds: ['rp1'], deviceIds: ['d1'] },
      ),
    ).toEqual({ patientId: 'p1', programId: null, deviceId: null })

    expect(
      reconcileHomePickerSelection(
        { patientId: 'p1', programId: QUICK_START_PROGRAM_ID, deviceId: 'd1' },
        { programIds: [], deviceIds: ['d1'] },
      ),
    ).toEqual({
      patientId: 'p1',
      programId: QUICK_START_PROGRAM_ID,
      deviceId: 'd1',
    })
  })
})

describe('clearRemovedHomePick', () => {
  const picked = { patientId: 'p1', programId: 'rp1', deviceId: 'd1' }

  it('clears the patient pick when that patient was removed', () => {
    expect(clearRemovedHomePick(picked, 'patientId', 'p1')).toEqual({
      ...picked,
      patientId: null,
    })
  })

  it('clears the program pick when that program was removed', () => {
    expect(clearRemovedHomePick(picked, 'programId', 'rp1')).toEqual({
      ...picked,
      programId: null,
    })
  })

  it('keeps the selection when something else was removed', () => {
    expect(clearRemovedHomePick(picked, 'patientId', 'p2')).toBe(picked)
  })
})
