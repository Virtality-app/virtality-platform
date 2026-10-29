'use client'

import Link from 'next/link'
import { Button } from '@virtality/ui/components/button'
import { useClientT } from '@/i18n/use-client-t'

export function CheckoutSuccessHomeCta({ enabled }: { enabled: boolean }) {
  const { t } = useClientT('home')

  if (!enabled) {
    return (
      <Button size='lg' disabled>
        {t('checkout.backToDashboard')}
      </Button>
    )
  }

  return (
    <Button asChild size='lg'>
      <Link href='/'>{t('checkout.backToDashboard')}</Link>
    </Button>
  )
}
