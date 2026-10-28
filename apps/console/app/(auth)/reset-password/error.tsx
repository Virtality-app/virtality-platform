'use client'
import { Button } from '@virtality/ui/components/button'
import { H2, P } from '@/components/typography'
import Link from 'next/link'
import { useEffect } from 'react'
import { useClientT } from '@/i18n/use-client-t'

export default function Error({
  error,
}: {
  error: Error & { digest?: string }
}) {
  const { t } = useClientT('auth')

  useEffect(() => {
    // Log the error to an error reporting service
  }, [error])

  return (
    <div className='flex h-screen flex-col items-center justify-center'>
      <H2>{t('resetPassword.errorTitle')}</H2>
      <P>
        {t('resetPassword.cause')}{' '}
        <span className='text-red-500'>{error.message}</span>
      </P>
      <Button variant='link'>
        <Link href='/'>{t('resetPassword.goBack')}</Link>
      </Button>
    </div>
  )
}
