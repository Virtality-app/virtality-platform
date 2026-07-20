'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import { getDemoBookingUrl } from '@/lib/demo-booking'
import {
  HERO_PRIMARY_CTA_LABEL,
  HERO_SECONDARY_CTA_LABEL,
} from '@/lib/hero-content'
import { scrollToFinalCta } from '@/lib/scroll-to-cta'
import HeroTitle from './hero-title'

const demoBookingUrl = getDemoBookingUrl()

/**
 * Full-bleed backdrop take with CTAs moved to the center bottom of the hero.
 * Logo, headline, and supporting copy stay in the original left position.
 */
const HeroImageBackdropCtaCenter = () => {
  return (
    <section className='min-h-screen-with-nav relative flex flex-col overflow-hidden bg-[#fbfaf7] dark:bg-zinc-900'>
      {/* Full-bleed backdrop photograph */}
      <div className='absolute inset-0'>
        <Image
          src='/hero/Gemini_Generated_Image_pvvcc4pvvcc4pvvc.png'
          alt='Patient putting on a VR headset during a guided therapy session'
          fill
          priority
          sizes='100vw'
          className='object-cover object-[48%_center] sm:object-[52%_center] md:object-[60%_center] lg:object-[68%_center]'
        />

        {/* Legibility scrim: light wash where the copy sits, image breathes toward the right */}
        <div className='absolute inset-0 bg-linear-to-r from-[#fbfaf7] via-[#fbfaf7]/92 to-[#fbfaf7]/35 sm:via-[#fbfaf7]/88 sm:to-[#fbfaf7]/20 md:via-[#fbfaf7]/82 md:to-[#fbfaf7]/10 lg:via-[#fbfaf7]/65 lg:to-transparent dark:from-zinc-900 dark:via-zinc-900/88 dark:to-zinc-900/15' />
        {/* Bottom fade so the image resolves into the next section */}
        <div className='absolute inset-0 bg-linear-to-t from-[#fbfaf7] via-transparent to-transparent dark:from-zinc-900' />
      </div>

      {/* Grain */}
      <div
        className='pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-multiply dark:opacity-[0.06] dark:mix-blend-overlay'
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Title — original left / vertical-center placement */}
      <div className='relative z-1 container m-auto flex flex-1 flex-col justify-center px-4 py-16 pb-28 md:px-8 md:py-20 md:pb-32'>
        <div className='max-w-xl'>
          <HeroTitle align='left' badge='logo' showCtas={false} />
        </div>
      </div>

      {/* CTAs — center bottom of the hero */}
      <div className='pointer-events-none absolute inset-x-0 bottom-8 z-10 flex justify-center px-4 md:bottom-12'>
        <div className='pointer-events-auto flex flex-col items-center gap-4 sm:flex-row sm:gap-5'>
          <Button
            variant='primary'
            className='h-auto rounded-full px-7 py-4 text-base font-semibold shadow-lg shadow-vital-blue-700/25 transition-all hover:shadow-xl hover:shadow-vital-blue-700/30'
            onClick={scrollToFinalCta}
          >
            <span className='flex items-center gap-2'>
              {HERO_PRIMARY_CTA_LABEL}
              <ArrowRight className='size-4' />
            </span>
          </Button>

          <Button
            asChild
            variant='ghost'
            className='h-auto rounded-full px-4 py-4 text-base font-semibold text-slate-700 underline-offset-4 hover:text-vital-blue-700 hover:underline dark:text-gray-200'
          >
            <Link
              href={demoBookingUrl}
              target='_blank'
              rel='noopener noreferrer'
            >
              {HERO_SECONDARY_CTA_LABEL}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default HeroImageBackdropCtaCenter
