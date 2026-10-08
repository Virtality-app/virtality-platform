import {
  CUSTOMER_ACCESS_STATUS_LABELS,
  type CustomerAccessStatus,
} from '@virtality/shared/utils'

const DAY_MS = 24 * 60 * 60 * 1000

/** Same rule as VR launch in Console: a live clock, or an admin/tester role. */
export function customerCanLaunchVr(status: CustomerAccessStatus): boolean {
  return (
    status === 'paid' ||
    status === 'trialing' ||
    status === 'admin' ||
    status === 'tester'
  )
}

export type CustomerTrialStanding =
  | { kind: 'none' }
  | { kind: 'expired' }
  | { kind: 'active'; daysLeft: number }

/** Days left on the open Timed Access Gate, counting a partial day as one. */
export function resolveCustomerTrialStanding(
  trialEnd: Date | string | null,
  now: Date,
): CustomerTrialStanding {
  if (trialEnd == null) return { kind: 'none' }
  const remainingMs = new Date(trialEnd).getTime() - now.getTime()
  if (!(remainingMs > 0)) return { kind: 'expired' }
  return { kind: 'active', daysLeft: Math.ceil(remainingMs / DAY_MS) }
}

export function formatCustomerTrialStanding(
  standing: CustomerTrialStanding,
): string {
  switch (standing.kind) {
    case 'none':
      return '-'
    case 'expired':
      return 'Expired'
    case 'active':
      return standing.daysLeft === 1
        ? '1 day left'
        : `${standing.daysLeft} days left`
  }
}

/**
 * The table's Access label: a customer with no VR access is Waitlist when
 * they signed up to the Waitlist, otherwise Blocked. Everyone else keeps
 * their access status label.
 */
export function formatCustomerTableAccess(input: {
  accessStatus: CustomerAccessStatus
  onWaitlist: boolean
}): string {
  if (input.accessStatus === 'blocked' && input.onWaitlist) return 'Waitlist'
  return CUSTOMER_ACCESS_STATUS_LABELS[input.accessStatus]
}
