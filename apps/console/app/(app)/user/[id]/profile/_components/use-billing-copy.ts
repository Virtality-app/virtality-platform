'use client'

import { useClientT } from '@/i18n/use-client-t'
import type { BillingCopy } from '@/lib/profile-billing'

/** The `user` translator plus the active language, for billing copy helpers. */
export function useBillingCopy(): BillingCopy {
  const { t, i18n } = useClientT(['user', 'common'])
  return { t, locale: i18n.language }
}
