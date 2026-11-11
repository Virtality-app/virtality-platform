import { describe, expect, it } from 'vitest'
import {
  defaultGranularityFor,
  formatRangeLabel,
  isRangeLongEnough,
  rangeForPreset,
} from './dashboard-range'

const today = new Date(2026, 10, 10)

describe('rangeForPreset', () => {
  it('ends every preset today, inclusive', () => {
    expect(rangeForPreset('7d', today)).toEqual({
      from: '2026-11-04',
      to: '2026-11-10',
    })
    expect(rangeForPreset('4w', today).from).toBe('2026-10-14')
    expect(rangeForPreset('8w', today).from).toBe('2026-09-16')
    expect(rangeForPreset('6m', today).from).toBe('2026-05-11')
    expect(rangeForPreset('all', today)).toEqual({
      from: '2026-11-10',
      to: '2026-11-10',
    })
  })
})

describe('defaultGranularityFor', () => {
  it('uses days for short windows and weeks for longer ones', () => {
    expect(defaultGranularityFor(rangeForPreset('7d', today))).toBe('day')
    expect(defaultGranularityFor(rangeForPreset('4w', today))).toBe('week')
  })
})

describe('isRangeLongEnough', () => {
  it('needs at least three calendar days', () => {
    expect(
      isRangeLongEnough(new Date(2026, 10, 1), new Date(2026, 10, 2)),
    ).toBe(false)
    expect(
      isRangeLongEnough(new Date(2026, 10, 1), new Date(2026, 10, 3)),
    ).toBe(true)
  })
})

describe('formatRangeLabel', () => {
  it('drops the first year when both ends share it', () => {
    expect(formatRangeLabel({ from: '2026-09-16', to: '2026-11-10' })).toBe(
      '16 Sep – 10 Nov 2026',
    )
    expect(formatRangeLabel({ from: '2025-12-01', to: '2026-01-10' })).toBe(
      '1 Dec 2025 – 10 Jan 2026',
    )
  })
})
