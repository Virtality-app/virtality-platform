'use client'

import { ErrorDisplay } from '@/components/feedback/error-display'
import { getWebsiteUrl } from '@virtality/shared/types'
import { isTrialRedeemWaitlistRedirect } from '@virtality/shared/utils'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useClientT } from '@/i18n/use-client-t'

const websiteURL = getWebsiteUrl()

const ErrorPage = () => {
  const { t } = useClientT('home')
  const message = useSearchParams().get('message')

  useEffect(() => {
    if (isTrialRedeemWaitlistRedirect(message)) {
      window.location.assign(`${websiteURL}/waitlist`)
    }
  }, [message])

  if (isTrialRedeemWaitlistRedirect(message)) {
    return null
  }

  return (
    <ErrorDisplay
      variant='page'
      title={t('error.title')}
      message={message ?? t('error.unknown')}
    />
  )
}

export default ErrorPage
