'use client'

import { useEffect, useState } from 'react'
import { Button } from '@virtality/ui/components/button'
import posthog from 'posthog-js'
import { usePathname } from 'next/navigation'
import { useClientT } from '@/i18n/use-client-t'
import { translateRich } from '@/i18n/translate-rich'
import { getWebsiteUrl } from '@virtality/shared/types'

const NOTICE_ACK_KEY = 'analytics:notice-acknowledged'
const websiteURL = getWebsiteUrl()

const hiddenRoutes = [
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/password-setup',
  '/verify-email',
  '/goodbye',
]

export default function CookieBanner() {
  const { t } = useClientT('layout')
  const pathname = usePathname()
  // Start acknowledged to avoid a flash before localStorage is read.
  const [acknowledged, setAcknowledged] = useState(true)

  useEffect(() => {
    // Keep default analytics opt-in; this notice is acknowledgment only.
    posthog.opt_in_capturing()
    if (localStorage.getItem('analytics:consent') !== 'granted') {
      localStorage.setItem('analytics:consent', 'granted')
    }
    setAcknowledged(localStorage.getItem(NOTICE_ACK_KEY) === '1')
  }, [])

  const handleUnderstand = () => {
    localStorage.setItem(NOTICE_ACK_KEY, '1')
    localStorage.setItem('analytics:consent', 'granted')
    posthog.opt_in_capturing()
    setAcknowledged(true)
  }

  const isHiddenRoute = hiddenRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )

  if (isHiddenRoute || acknowledged || !posthog.__loaded) {
    return null
  }

  return (
    <section className='pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center sm:inset-x-6 sm:bottom-6'>
      <div className='pointer-events-auto w-full max-w-xl rounded-2xl border border-zinc-300/80 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/85'>
        <div className='flex flex-col gap-3'>
          <div className='space-y-1'>
            <p className='text-vital-blue-700 dark:text-vital-blue-300 text-[11px] font-semibold tracking-[0.2em] uppercase'>
              {t('cookie.notice')}
            </p>
            <p className='text-sm leading-relaxed text-zinc-700 dark:text-zinc-200'>
              {translateRich(t, 'cookie.agreement', {
                terms: (
                  <a
                    href={`${websiteURL}/terms`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover:text-vital-blue-700 underline'
                  >
                    {t('cookie.terms')}
                  </a>
                ),
                privacy: (
                  <a
                    href={`${websiteURL}/privacy`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover:text-vital-blue-700 underline'
                  >
                    {t('cookie.privacy')}
                  </a>
                ),
              })}
            </p>
          </div>
          <div className='flex self-end'>
            <Button
              type='button'
              variant='primary'
              size='sm'
              onClick={handleUnderstand}
              className='w-full shrink-0 sm:w-auto'
            >
              {t('cookie.understand')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
