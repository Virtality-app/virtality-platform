import CallToAction from '@/components/home/call-to-action'
import Benefits from '@/components/home/benefits'
import BenefitsGrid from '@/components/home/benefits-grid'
import Features from '@/components/home/features'
import Hero from '@/components/home/hero'
import PilotProof from '@/components/home/pilot-proof'
import PoweredBy from '@/components/home/powered-by'
import Press from '@/components/home/press'
import Testimonials from '@/components/home/testimonials'
import PromoVideo from '@/components/video/promo-video'

const HomePage = () => {
  return (
    <div className='bg-white text-slate-900 dark:bg-zinc-900 dark:text-gray-100'>
      <Hero />
      <BenefitsGrid />
      <Testimonials />
      <PilotProof />
      <PromoVideo />
      <Features />
      <PoweredBy />
      <Press />
      <Benefits />
      <CallToAction />
    </div>
  )
}

export default HomePage
