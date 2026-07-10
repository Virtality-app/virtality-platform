'use client'

import Link from 'next/link'
import { Button } from '@virtality/ui/components/button'
import { ArrowRight, Activity } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { getDemoBookingUrl } from '@/lib/demo-booking'
import {
  HERO_HEADLINE,
  HERO_PRIMARY_CTA_LABEL,
  HERO_SECONDARY_CTA_LABEL,
  HERO_SUPPORTING_COPY,
} from '@/lib/hero-content'
import { scrollToFinalCta } from '@/lib/scroll-to-cta'
import { splitText } from '@/lib/utils'
import { animate, stagger } from 'motion/react'

const HeroTitle = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const demoBookingUrl = getDemoBookingUrl()

  useEffect(() => {
    document.fonts.ready.then(() => {
      if (!containerRef.current) return

      containerRef.current.style.visibility = 'visible'

      const { words, chars } = splitText(
        containerRef.current.querySelector('h1')!,
        {
          wordClass: 'split-word',
          charClass: 'split-char',
          preserveWhitespace: true,
        },
      )
      animate(
        words,
        { opacity: [0, 1], y: [20, 0] },
        {
          type: 'spring',
          duration: 1.5,
          bounce: 0,
          delay: stagger(0.04),
        },
      )
      animate(
        chars,
        { opacity: [0, 1] },
        {
          duration: 0.4,
          delay: stagger(0.008),
        },
      )
    })
  }, [])

  return (
    <div ref={containerRef} className='space-y-8'>
      <div className='inline-flex items-center gap-2 rounded-full bg-linear-to-r from-vital-blue-700 to-vital-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-vital-blue-700/20'>
        <Activity className='w-4 h-4' />
        <span className='tracking-wide'>Evidence-Based VR Therapy</span>
      </div>

      <h1 className='text-4xl font-bold leading-[1.15] md:text-5xl lg:text-6xl text-slate-900 dark:text-white'>
        {HERO_HEADLINE}
      </h1>

      <p className='text-lg leading-relaxed text-slate-600 dark:text-gray-300 md:text-xl max-w-xl'>
        {HERO_SUPPORTING_COPY}
      </p>

      <div className='flex flex-col sm:flex-row gap-4 pt-4'>
        <Button
          variant='primary'
          className='h-auto px-6 py-4 text-base font-semibold shadow-lg shadow-vital-blue-700/25 hover:shadow-xl hover:shadow-vital-blue-700/30 transition-all flex items-center gap-2 group'
          onClick={scrollToFinalCta}
        >
          {HERO_PRIMARY_CTA_LABEL}
          <ArrowRight className='size-5 group-hover:translate-x-1 transition-transform' />
        </Button>

        <Button
          asChild
          variant='outline'
          className='h-auto px-6 py-4 text-base font-semibold border-2 border-vital-blue-700 text-vital-blue-700 hover:bg-vital-blue-50'
        >
          <Link href={demoBookingUrl} target='_blank' rel='noopener noreferrer'>
            {HERO_SECONDARY_CTA_LABEL}
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default HeroTitle
