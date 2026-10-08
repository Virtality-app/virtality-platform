import { describe, expect, it } from 'vitest'
import {
  customerCanLaunchVr,
  formatCustomerTableAccess,
  formatCustomerTrialStanding,
  resolveCustomerTrialStanding,
} from './customer-table-display.ts'

const NOW = new Date('2026-08-10T12:00:00.000Z')

describe('customerCanLaunchVr', () => {
  it('allows a live clock and admin/tester roles', () => {
    expect(customerCanLaunchVr('paid')).toBe(true)
    expect(customerCanLaunchVr('trialing')).toBe(true)
    expect(customerCanLaunchVr('admin')).toBe(true)
    expect(customerCanLaunchVr('tester')).toBe(true)
  })

  it('blocks customers without a live clock', () => {
    expect(customerCanLaunchVr('blocked')).toBe(false)
    expect(customerCanLaunchVr('free')).toBe(false)
  })
})

describe('resolveCustomerTrialStanding', () => {
  it('has no trial without an open Timed Access Gate', () => {
    expect(resolveCustomerTrialStanding(null, NOW)).toEqual({ kind: 'none' })
  })

  it('counts a partial day as a full day left', () => {
    expect(
      resolveCustomerTrialStanding(new Date('2026-08-12T13:00:00.000Z'), NOW),
    ).toEqual({ kind: 'active', daysLeft: 3 })
    expect(
      resolveCustomerTrialStanding('2026-08-10T12:00:01.000Z', NOW),
    ).toEqual({ kind: 'active', daysLeft: 1 })
  })

  it('is expired once the clock end has passed', () => {
    expect(resolveCustomerTrialStanding(NOW, NOW)).toEqual({
      kind: 'expired',
    })
  })
})

describe('formatCustomerTrialStanding', () => {
  it('labels each trial standing', () => {
    expect(formatCustomerTrialStanding({ kind: 'none' })).toBe('-')
    expect(formatCustomerTrialStanding({ kind: 'expired' })).toBe('Expired')
    expect(formatCustomerTrialStanding({ kind: 'active', daysLeft: 1 })).toBe(
      '1 day left',
    )
    expect(formatCustomerTrialStanding({ kind: 'active', daysLeft: 12 })).toBe(
      '12 days left',
    )
  })
})

describe('formatCustomerTableAccess', () => {
  it('splits customers without VR access into Waitlist and Blocked', () => {
    expect(
      formatCustomerTableAccess({ accessStatus: 'blocked', onWaitlist: true }),
    ).toBe('Waitlist')
    expect(
      formatCustomerTableAccess({ accessStatus: 'blocked', onWaitlist: false }),
    ).toBe('Blocked')
  })

  it('keeps the access status label for everyone else', () => {
    expect(
      formatCustomerTableAccess({ accessStatus: 'paid', onWaitlist: true }),
    ).toBe('Paid')
    expect(
      formatCustomerTableAccess({ accessStatus: 'tester', onWaitlist: false }),
    ).toBe('Tester')
  })
})
