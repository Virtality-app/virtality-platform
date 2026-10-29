'use client'

import Link from 'next/link'
import { Button } from '@virtality/ui/components/button'
import { useClientT } from '@/i18n/use-client-t'
import { profileBillingHref } from '@/lib/renew-prompt-dismiss'

export function CheckoutSuccessTimeoutMessage({ userId }: { userId: string }) {
  const { t } = useClientT('home')

  return (
    <div className='space-y-2 text-sm'>
      <p className='text-muted-foreground'>{t('checkout.timeout')}</p>
      <Button asChild variant='outline' size='sm'>
        <Link href={profileBillingHref(userId)}>
          {t('checkout.openBilling')}
        </Link>
      </Button>
    </div>
  )
}
