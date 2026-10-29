'use client'

import { useClientT } from '@/i18n/use-client-t'

export function CheckoutSuccessActivatingMessage() {
  const { t } = useClientT('home')
  return (
    <p className='text-muted-foreground text-sm'>{t('checkout.activating')}</p>
  )
}
