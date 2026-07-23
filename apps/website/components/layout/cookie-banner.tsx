'use client'

import { useEffect, useState } from 'react'
import { Button } from '@virtality/ui/components/button'
import posthog from 'posthog-js'

export default function CookieBanner() {
  const [consentGiven, setConsentGiven] = useState<
    'granted' | 'denied' | 'pending'
  >('denied')

  useEffect(() => {
    const hasGivenConsent = posthog.get_explicit_consent_status()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsentGiven(hasGivenConsent)
  }, [])

  const handleAcceptConsent = () => {
    posthog.opt_in_capturing()
    localStorage.setItem('analytics:consent', 'granted')
    setConsentGiven('granted')
  }

  const handleDeclineConsent = () => {
    posthog.opt_out_capturing()
    localStorage.setItem('analytics:consent', 'denied')
    setConsentGiven('denied')
  }

  if (consentGiven !== 'pending' || !posthog.__loaded) {
    return null
  }

  return (
    <section className='pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center sm:inset-x-6 sm:bottom-6'>
      <div className='pointer-events-auto w-full max-w-xl rounded-2xl border border-vital-blue-100/80 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-md'>
        <div className='flex flex-col gap-3'>
          <div className='space-y-1'>
            <p className='text-vital-blue-700 text-[11px] font-semibold tracking-[0.2em] uppercase'>
              Cookie note
            </p>
            <p className='text-sm leading-relaxed text-slate-700'>
              We use first-party analytics cookies to understand how the site is
              used and improve it. You can accept or decline.
            </p>
          </div>
          <div className='flex gap-2 self-end'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={handleDeclineConsent}
              className='w-full shrink-0 sm:w-auto'
            >
              Decline cookies
            </Button>
            <Button
              type='button'
              variant='primary'
              size='sm'
              onClick={handleAcceptConsent}
              className='w-full shrink-0 sm:w-auto'
            >
              Accept cookies
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
