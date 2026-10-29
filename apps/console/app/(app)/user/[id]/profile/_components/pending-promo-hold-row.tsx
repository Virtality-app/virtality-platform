'use client'

/**
 * Open Checkout hold for a Promotion Code (pre-subscribe). Cancel clears the hold.
 */

import { Badge } from '@virtality/ui/components/badge'
import { Button } from '@virtality/ui/components/button'
import { useClientT } from '@/i18n/use-client-t'

export function PendingPromoHoldRow({
  code,
  canceling,
  onCancel,
}: {
  code: string
  canceling: boolean
  onCancel: () => void
}) {
  const { t } = useClientT(['user', 'common'])
  return (
    <div className='flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-2.5 dark:border-zinc-800'>
      <div className='flex flex-wrap items-center gap-2'>
        <Badge variant='secondary' className='font-mono'>
          {code}
        </Badge>
        <span className='text-sm text-zinc-600 dark:text-zinc-400'>
          {t('billing.promo.savedForCheckout')}
        </span>
      </div>
      <Button
        type='button'
        variant='outline'
        size='sm'
        disabled={canceling}
        onClick={onCancel}
      >
        {canceling ? t('billing.action.canceling') : t('common:btn.cancel')}
      </Button>
    </div>
  )
}
