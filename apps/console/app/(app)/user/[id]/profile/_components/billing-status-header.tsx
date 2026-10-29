'use client'

import { cn } from '@/lib/utils'
import {
  profileBillingStatusDetail,
  profileBillingStatusHeadline,
  type BillingStandingView,
} from '@/lib/profile-billing'
import { useBillingCopy } from './use-billing-copy'

const LAPSED_TRIAL_ACCENT = 'text-red-600 dark:text-red-500'

/**
 * Billing tab heading: section label, plan headline and renewal / expiry detail.
 */
export function BillingStatusHeader({
  standing,
  productName,
  lapsed,
}: {
  standing: BillingStandingView
  productName: string
  lapsed: boolean
}) {
  const copy = useBillingCopy()

  return (
    <header className='space-y-2'>
      <p
        className={cn(
          'text-xs font-medium tracking-wide uppercase',
          lapsed ? LAPSED_TRIAL_ACCENT : 'text-zinc-500',
        )}
      >
        {copy.t('billing.title')}
      </p>
      <h2
        className={cn(
          'text-2xl font-semibold tracking-tight',
          lapsed && LAPSED_TRIAL_ACCENT,
        )}
      >
        {profileBillingStatusHeadline(copy, standing, productName)}
      </h2>
      <p className='text-sm text-zinc-500'>
        {profileBillingStatusDetail(copy, standing, productName)}
      </p>
    </header>
  )
}
