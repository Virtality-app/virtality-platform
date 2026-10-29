'use client'

import { useClientT } from '@/i18n/use-client-t'
import { Button } from '@virtality/ui/components/button'
import { Card } from '@virtality/ui/components/card'
import Image from 'next/image'
import Link from 'next/link'
import { getWebsiteUrl } from '@virtality/shared/types'
import { shouldBypassVercelImageOptimization } from '@virtality/shared/utils'

const baseURL = getWebsiteUrl()

const cdnURL = process.env.NEXT_PUBLIC_CDN_URL
const goodbyeLogoSrc = `${cdnURL}/small_logo_400x400.png`

const GoodbyePage = () => {
  const { t } = useClientT(['home', 'common'])

  return (
    <section className='flex h-screen items-center justify-center'>
      <Card className='w-full max-w-2xl space-y-6 p-8 text-center md:p-12'>
        <div className='space-y-4'>
          <div className='bg-primary/10 mb-2 inline-flex size-24 items-center justify-center rounded-full'>
            <Image
              alt={t('goodbye.logoAlt')}
              width={50}
              height={50}
              src={goodbyeLogoSrc}
              unoptimized={shouldBypassVercelImageOptimization(goodbyeLogoSrc)}
            />
          </div>

          <h1 className='text-3xl font-bold text-balance md:text-4xl'>
            {t('goodbye.title')}
          </h1>

          <p className='text-muted-foreground mx-auto max-w-xl text-lg leading-relaxed text-pretty'>
            {t('goodbye.description')}
          </p>
        </div>

        <div className='space-y-4 pt-4'>
          <div className='bg-muted/50 space-y-3 rounded-lg p-6'>
            <h2 className='text-foreground font-semibold'>
              {t('goodbye.nextTitle')}
            </h2>
            <ul className='text-muted-foreground mx-auto max-w-md space-y-2 text-left text-sm'>
              <li className='flex items-start gap-2'>
                <span className='text-primary mt-0.5'>•</span>
                <span>{t('goodbye.nextData')}</span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-primary mt-0.5'>•</span>
                <span>{t('goodbye.nextEmails')}</span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-primary mt-0.5'>•</span>
                <span>{t('goodbye.nextWelcomeBack')}</span>
              </li>
            </ul>
          </div>

          <div className='flex flex-col justify-center gap-3 pt-2 sm:flex-row'>
            <Button asChild variant='default' size='lg'>
              <Link href='/'>{t('goodbye.returnHome')}</Link>
            </Button>
            <Button asChild variant='outline' size='lg'>
              <Link href={baseURL + '/contact'}>
                {t('goodbye.shareFeedback')}
              </Link>
            </Button>
          </div>
        </div>

        <div className='border-t pt-6'>
          <p className='text-muted-foreground text-sm'>{t('goodbye.thanks')}</p>
        </div>
      </Card>
    </section>
  )
}

export default GoodbyePage
