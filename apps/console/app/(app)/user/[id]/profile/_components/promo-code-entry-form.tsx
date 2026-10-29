'use client'

/**
 * Unified Promotion or Access Code input and apply control for the billing tab.
 */

import { Button } from '@virtality/ui/components/button'
import { Input } from '@virtality/ui/components/input'
import { useClientT } from '@/i18n/use-client-t'

export function PromoCodeEntryForm({
  code,
  onCodeChange,
  redeeming,
  redeemError,
  successFlash,
  onApply,
  applyLabel,
  fieldLabel,
}: {
  code: string
  onCodeChange: (value: string) => void
  redeeming: boolean
  redeemError: string | null
  successFlash: boolean
  onApply: () => void
  applyLabel?: string
  fieldLabel?: string
}) {
  const { t } = useClientT(['user', 'common'])
  return (
    <>
      {successFlash ? (
        <p className='text-sm text-emerald-700 dark:text-emerald-300'>
          {t('billing.promo.enterNewCode')}
        </p>
      ) : null}
      <div className='flex gap-2'>
        <Input
          value={code}
          onChange={(event) => onCodeChange(event.target.value.toUpperCase())}
          placeholder={t('billing.promo.enterCode')}
          className='font-mono'
          aria-label={fieldLabel ?? t('billing.promo.entryLabel')}
          disabled={redeeming}
        />
        <Button
          type='button'
          variant='outline'
          disabled={!code.trim() || redeeming}
          onClick={onApply}
        >
          {redeeming
            ? t('billing.promo.applying')
            : (applyLabel ?? t('billing.promo.apply'))}
        </Button>
      </div>
      {redeemError ? (
        <p className='text-sm text-red-600 dark:text-red-400'>{redeemError}</p>
      ) : null}
    </>
  )
}
