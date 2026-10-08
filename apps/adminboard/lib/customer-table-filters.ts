import type { ColumnFiltersState, FilterFn } from '@tanstack/react-table'
import {
  CUSTOMER_ACCESS_STATUS_LABELS,
  CUSTOMER_BILLING_STATUS_LABELS,
  type AdminCustomerListItem,
} from '@virtality/shared/utils'
import {
  resolveCustomerTrialStanding,
  type CustomerTrialStanding,
} from './customer-table-display.ts'

/** `with` / `without` keep only customers who can / cannot launch VR. */
export type CustomerVrFilter = 'all' | 'with' | 'without'

export type CustomerTableFilters = {
  vr: CustomerVrFilter
  trial: string[]
  access: string[]
  billing: string[]
}

export const EMPTY_CUSTOMER_TABLE_FILTERS: CustomerTableFilters = {
  vr: 'all',
  trial: [],
  access: [],
  billing: [],
}

export const CUSTOMER_TRIAL_FILTER_OPTIONS = ['Active', 'Expired', 'No trial']

export const CUSTOMER_ACCESS_FILTER_OPTIONS = [
  'Waitlist',
  CUSTOMER_ACCESS_STATUS_LABELS.blocked,
  CUSTOMER_ACCESS_STATUS_LABELS.trialing,
  CUSTOMER_ACCESS_STATUS_LABELS.paid,
  CUSTOMER_ACCESS_STATUS_LABELS.free,
  CUSTOMER_ACCESS_STATUS_LABELS.tester,
  CUSTOMER_ACCESS_STATUS_LABELS.admin,
]

export const CUSTOMER_BILLING_FILTER_OPTIONS = Object.values(
  CUSTOMER_BILLING_STATUS_LABELS,
)

export function customerTrialFilterLabel(
  standing: CustomerTrialStanding,
): string {
  switch (standing.kind) {
    case 'none':
      return 'No trial'
    case 'expired':
      return 'Expired'
    case 'active':
      return 'Active'
  }
}

/** Trial filter over the row's trial standing at the table's `now`. */
export function createCustomerTrialFilterFn(
  now: Date,
): FilterFn<AdminCustomerListItem> {
  return (row, _columnId, filterValue) => {
    if (!Array.isArray(filterValue) || filterValue.length === 0) return true
    const standing = resolveCustomerTrialStanding(row.original.trialEnd, now)
    return filterValue.includes(customerTrialFilterLabel(standing))
  }
}

/** Column filters for TanStack: only the active ones are emitted. */
export const buildCustomerColumnFilters = (
  filters: CustomerTableFilters,
): ColumnFiltersState => [
  ...(filters.vr !== 'all' ? [{ id: 'vr', value: filters.vr === 'with' }] : []),
  ...(filters.trial.length > 0 ? [{ id: 'trial', value: filters.trial }] : []),
  ...(filters.access.length > 0
    ? [{ id: 'access', value: filters.access }]
    : []),
  ...(filters.billing.length > 0
    ? [{ id: 'billing', value: filters.billing }]
    : []),
]

export const countActiveCustomerFilters = (
  filters: CustomerTableFilters,
): number => buildCustomerColumnFilters(filters).length

/** Pressing the active VR pill clears it; the other pill switches to it. */
export const toggleCustomerVrFilter = (
  current: CustomerVrFilter,
  pressed: Exclude<CustomerVrFilter, 'all'>,
): CustomerVrFilter => (current === pressed ? 'all' : pressed)
