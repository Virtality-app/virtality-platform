import { describe, expect, it } from 'vitest'
import { ageFromDob, lastVisit } from './patient-profile-summary'

const NOW = new Date('2026-11-22T10:00:00Z')

describe('ageFromDob', () => {
  it('counts whole years, before and after the birthday', () => {
    expect(ageFromDob('1990-03-12', NOW)).toBe(36)
    expect(ageFromDob('1990-12-01', NOW)).toBe(35)
  })

  it('is null for a missing, invalid or future date', () => {
    expect(ageFromDob(null, NOW)).toBeNull()
    expect(ageFromDob('not a date', NOW)).toBeNull()
    expect(ageFromDob('2030-01-01', NOW)).toBeNull()
  })
})

describe('lastVisit', () => {
  it('picks the latest completion, falling back to the start', () => {
    expect(
      lastVisit([
        {
          createdAt: '2026-08-14T09:00:00Z',
          completedAt: '2026-08-14T09:40:00Z',
        },
        { createdAt: '2026-08-28T09:00:00Z', completedAt: null },
        {
          createdAt: '2026-08-21T09:00:00Z',
          completedAt: '2026-08-21T09:38:00Z',
        },
      ]),
    ).toEqual(new Date('2026-08-28T09:00:00Z'))
  })

  it('is null with no sessions', () => {
    expect(lastVisit([])).toBeNull()
  })
})
