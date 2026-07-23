import Benefits from '@/sections/benefits'
import BenefitsGrid from '@/sections/benefits-grid'
import CallToAction from '@/sections/cta'
import Features from '@/sections/features'
import Hero from '@/sections/hero'
import MosaicSection from '@/sections/mosaic'
import PromoVideo from '@/sections/promo-video'
import SupportedBy from '@/sections/supported-by'
import Testimonials from '@/sections/testimonials'

const HomePage = () => {
  return (
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
  )
}

export default HomePage
