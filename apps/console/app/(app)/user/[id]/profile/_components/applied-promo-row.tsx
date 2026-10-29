'use client'

/**
 * Applied Promotion Code row with remove Discount action.
 */

import { Badge } from '@virtality/ui/components/badge'
import { Button } from '@virtality/ui/components/button'
import { useClientT } from '@/i18n/use-client-t'

export function AppliedPromoRow({
  appliedCode,
  onRemove,
}: {
  appliedCode: string | null
  onRemove: () => void
}) {
  const { t } = useClientT(['user', 'common'])
  return (
    <div className='flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-2.5 dark:border-zinc-800'>
      <div className='flex flex-wrap items-center gap-2'>
        <Badge variant='secondary' className='font-mono'>
          {appliedCode ?? t('billing.promo.applied')}
        </Badge>
        <span className='text-sm text-zinc-600 dark:text-zinc-400'>
          {t('billing.promo.appliedOnSubscription')}
        </span>
      </div>
      <Button type='button' variant='outline' size='sm' onClick={onRemove}>
        {t('billing.promo.removeDiscount')}
      </Button>
    </div>
  )
}
