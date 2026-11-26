import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getWebsiteUrl } from '@virtality/shared/types'
import JsonLd from '@/components/shared/json-ld'
import { buildOrganizationJsonLd } from '@/lib/json-ld'
import { buildHomeMetadata } from '@/lib/page-metadata'
import Benefits from '@/sections/benefits'
import BenefitsGrid from '@/sections/benefits-grid'
import CallToAction from '@/sections/cta'
import Features from '@/sections/features'
import Hero from '@/sections/hero'
import MosaicSection from '@/sections/mosaic'
import PromoVideo from '@/sections/promo-video'
import SupportedBy from '@/sections/supported-by'
import Testimonials from '@/sections/testimonials'
import { prefetchMarketingHomeQueries } from '@/lib/marketing-prefetch'

export const metadata: Metadata = buildHomeMetadata()

const socialProfiles = [
  process.env.LINKEDIN_URL,
  process.env.FACEBOOK_URL,
  process.env.INSTAGRAM_URL,
  process.env.X_URL,
]

const HomePage = async () => {
  const queryClient = await prefetchMarketingHomeQueries()

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <JsonLd data={buildOrganizationJsonLd(getWebsiteUrl(), socialProfiles)} />
      <div className='bg-white text-slate-900 dark:bg-zinc-900 dark:text-gray-100'>
        <Hero />
        <BenefitsGrid />
        <Testimonials />
        <MosaicSection />
        <PromoVideo />
        <Features />
        <Benefits />
        <SupportedBy />
        <CallToAction />
      </div>
    </HydrationBoundary>
  )
}

export default HomePage
