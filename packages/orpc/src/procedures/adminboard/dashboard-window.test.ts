import { describe, expect, it } from 'vitest'
import {
  resolveDashboardWindow,
  toISODate,
  validateDashboardWindow,
} from './dashboard-window.ts'

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`)

describe('validateDashboardWindow', () => {
  it('needs from on or before to, and at least three days', () => {
    expect(
      validateDashboardWindow({
        from: day('2026-11-10'),
        to: day('2026-11-09'),
        allTime: false,
      })?.path,
    ).toBe('to')
    expect(
      validateDashboardWindow({
        from: day('2026-11-09'),
        to: day('2026-11-10'),
        allTime: false,
      })?.path,
    ).toBe('from')
    expect(
      validateDashboardWindow({
        from: day('2026-11-08'),
        to: day('2026-11-10'),
        allTime: false,
      }),
    ).toBeNull()
  })

  it('accepts any dates for All Time', () => {
    expect(
      validateDashboardWindow({
        from: day('2026-11-10'),
        to: day('2026-11-10'),
        allTime: true,
      }),
    ).toBeNull()
  })
})

describe('resolveDashboardWindow', () => {
  it('uses the requested days with an exclusive end', () => {
    const window = resolveDashboardWindow(
      {
        from: new Date('2026-11-01T15:30:00.000Z'),
        to: day('2026-11-10'),
        allTime: false,
      },
      day('2025-01-01'),
    )
    expect(toISODate(window.from)).toBe('2026-11-01')
    expect(toISODate(window.to)).toBe('2026-11-10')
    expect(window.toExclusive.toISOString()).toBe('2026-11-11T00:00:00.000Z')
  })

  it('starts All Time on the day of the first session', () => {
    const window = resolveDashboardWindow(
      { from: day('2026-11-10'), to: day('2026-11-10'), allTime: true },
      new Date('2025-11-19T16:39:07.000Z'),
    )
    expect(toISODate(window.from)).toBe('2025-11-19')
  })

  it('collapses All Time to the end day when there are no sessions', () => {
    const window = resolveDashboardWindow(
      { from: day('2026-11-10'), to: day('2026-11-10'), allTime: true },
      null,
    )
    expect(toISODate(window.from)).toBe('2026-11-10')
  })
})
