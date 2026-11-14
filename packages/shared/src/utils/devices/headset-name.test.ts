import { describe, expect, it } from 'vitest'
import {
  compareHeadsetNames,
  nextHeadsetName,
  nextHeadsetNames,
} from './headset-name.ts'

describe('Headset-## names', () => {
  it('starts every group at Headset-01', () => {
    expect(nextHeadsetName([])).toBe('Headset-01')
  })

  it('continues after the highest number already in the group', () => {
    expect(nextHeadsetName(['Headset-01', 'Headset-03'])).toBe('Headset-04')
    expect(nextHeadsetName(['Headset-99'])).toBe('Headset-100')
  })

  it('ignores names outside the scheme, such as ones clinicians typed', () => {
    expect(nextHeadsetName(['Clinic room 2', 'Headset-x', 'Headset-02'])).toBe(
      'Headset-03',
    )
  })

  it('names several arrivals in a row', () => {
    expect(nextHeadsetNames(['Headset-01'], 2)).toEqual([
      'Headset-02',
      'Headset-03',
    ])
    expect(nextHeadsetNames([], 0)).toEqual([])
  })

  it('orders headsets by number, not as text', () => {
    expect(
      ['Headset-10', 'Headset-02', 'Spare', 'Headset-01'].sort(
        compareHeadsetNames,
      ),
    ).toEqual(['Headset-01', 'Headset-02', 'Headset-10', 'Spare'])
  })
})
