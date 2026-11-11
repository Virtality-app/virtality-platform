import { describe, expect, it } from 'vitest'
import {
  formatBucketLabel,
  formatLastActive,
  formatMinutes,
  formatShare,
} from './dashboard-format'

describe('formatMinutes', () => {
  it('reads as minutes, hours and minutes, or whole hours', () => {
    expect(formatMinutes(null)).toBe('—')
    expect(formatMinutes(28.6)).toBe('29 min')
    expect(formatMinutes(125)).toBe('2 h 5 min')
    expect(formatMinutes(120)).toBe('2 h')
    expect(formatMinutes(11860)).toBe('198 h')
  })
})

describe('formatShare', () => {
  it('rounds to a whole percent and handles an empty total', () => {
    expect(formatShare(268, 412)).toBe('65%')
    expect(formatShare(0, 0)).toBe('—')
  })
})

describe('formatBucketLabel', () => {
  it('labels days and weeks', () => {
    expect(formatBucketLabel('2026-11-09', 'day')).toBe('Mon 9 Nov')
    expect(formatBucketLabel('2026-11-09', 'week')).toBe('w/c 9 Nov')
  })
})

describe('formatLastActive', () => {
  const now = new Date(2026, 10, 10, 15, 0)

  it('says today, yesterday, days ago, then a date', () => {
    expect(formatLastActive(null, now)).toBe('—')
    expect(formatLastActive(new Date(2026, 10, 10, 9).toISOString(), now)).toBe(
      'Today',
    )
    expect(formatLastActive(new Date(2026, 10, 9, 9).toISOString(), now)).toBe(
      'Yesterday',
    )
    expect(formatLastActive(new Date(2026, 10, 6, 9).toISOString(), now)).toBe(
      '4 days ago',
    )
    expect(formatLastActive(new Date(2026, 9, 1, 9).toISOString(), now)).toBe(
      '1 Oct',
    )
  })
})
