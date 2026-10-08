import { describe, expect, it } from 'vitest'
import type { Row } from '@tanstack/react-table'
import type { AdminCustomerListItem } from '@virtality/shared/utils'
import {
  buildCustomerColumnFilters,
  countActiveCustomerFilters,
  createCustomerTrialFilterFn,
  EMPTY_CUSTOMER_TABLE_FILTERS,
  toggleCustomerVrFilter,
} from './customer-table-filters.ts'

const NOW = new Date('2026-08-10T12:00:00.000Z')

describe('customer table filters', () => {
  it('emits only the active column filters', () => {
    expect(buildCustomerColumnFilters(EMPTY_CUSTOMER_TABLE_FILTERS)).toEqual([])
    expect(
      buildCustomerColumnFilters({
        vr: 'without',
        trial: ['Expired'],
        access: ['Waitlist', 'Blocked'],
        billing: [],
      }),
    ).toEqual([
      { id: 'vr', value: false },
      { id: 'trial', value: ['Expired'] },
      { id: 'access', value: ['Waitlist', 'Blocked'] },
    ])
  })

  it('counts the active filters', () => {
    expect(
      countActiveCustomerFilters({
        ...EMPTY_CUSTOMER_TABLE_FILTERS,
        vr: 'with',
        billing: ['Active', 'Trialing'],
      }),
    ).toBe(2)
  })

  it('toggles the VR pills', () => {
    expect(toggleCustomerVrFilter('all', 'with')).toBe('with')
    expect(toggleCustomerVrFilter('with', 'with')).toBe('all')
    expect(toggleCustomerVrFilter('with', 'without')).toBe('without')
  })

  it('filters rows by trial standing', () => {
    const filterFn = createCustomerTrialFilterFn(NOW)
    const row = (trialEnd: Date | null) =>
      ({ original: { trialEnd } }) as unknown as Row<AdminCustomerListItem>
    const active = row(new Date('2026-08-12T12:00:00.000Z'))
    const expired = row(new Date('2026-08-01T12:00:00.000Z'))
    const none = row(null)
    const noop = () => {}

    expect(filterFn(active, 'trial', [], noop)).toBe(true)
    expect(filterFn(active, 'trial', ['Active'], noop)).toBe(true)
    expect(filterFn(expired, 'trial', ['Active'], noop)).toBe(false)
    expect(filterFn(expired, 'trial', ['Expired', 'No trial'], noop)).toBe(true)
    expect(filterFn(none, 'trial', ['No trial'], noop)).toBe(true)
  })
})
