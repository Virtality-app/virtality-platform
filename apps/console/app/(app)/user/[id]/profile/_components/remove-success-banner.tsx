'use client'

/**
 * Banner after a promo Discount is removed from the subscription.
 */

import { CheckCircle2, X } from 'lucide-react'
import { useClientT } from '@/i18n/use-client-t'

export function RemoveSuccessBanner({ onDismiss }: { onDismiss: () => void }) {
  const { t } = useClientT(['user', 'common'])
  return (
    <div className='rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-900 dark:bg-emerald-950/40'>
      <div className='flex gap-2'>
        <CheckCircle2 className='mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-300' />
        <div className='min-w-0 flex-1'>
          <p className='text-sm font-medium text-emerald-900 dark:text-emerald-100'>
            {t('billing.promo.removeSuccess')}
          </p>
          <p className='mt-0.5 text-sm text-emerald-800 dark:text-emerald-200'>
            {t('billing.promo.removeSuccessBody', {
              timing: t('billing.discountTiming'),
            })}
          </p>
        </div>
        <button
          type='button'
          onClick={onDismiss}
          className='shrink-0 text-emerald-700 hover:text-emerald-900 dark:text-emerald-300'
          aria-label={t('billing.promo.dismiss')}
        >
          <X className='size-4' />
        </button>
      </div>
    </div>
  )
}
