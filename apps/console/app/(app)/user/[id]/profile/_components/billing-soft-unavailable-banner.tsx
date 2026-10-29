'use client'

/**
 * Soft-unavailable banner when Discount terms cannot be shown.
 */

import { useClientT } from '@/i18n/use-client-t'

export function BillingSoftUnavailableBanner() {
  const { t } = useClientT(['user', 'common'])
  return (
    <p className='rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900'>
      {t('billing.softUnavailable')}
    </p>
  )
}
