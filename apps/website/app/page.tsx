import CallToAction from '@/components/home/call-to-action'
import Benefits from '@/components/home/benefits'
import BenefitsGrid from '@/components/home/benefits-grid'
import Features from '@/components/home/features'
import HeroImageBackdropCtaCenter from '@/components/home/hero-image-backdrop-cta-center'
// import HeroImageBackdrop from '@/components/home/hero-image-backdrop'
// import HeroImageBackdropScaled from '@/components/home/hero-image-backdrop-scaled'
import PilotProof from '@/components/home/pilot-proof'
import SupportedBy from '@/components/home/supported-by'
import Testimonials from '@/components/home/testimonials'
import PromoVideo from '@/components/video/promo-video'

const HomePage = () => {
  return (
    <div className='bg-white text-slate-900 dark:bg-zinc-900 dark:text-gray-100'>
      {/* <HeroImageBackdrop /> */}
      {/* <HeroImageBackdropScaled /> */}
      <HeroImageBackdropCtaCenter />
      <BenefitsGrid />
      <Testimonials />
      <PilotProof />
      <PromoVideo />
      <Features />
      <Benefits />
      <SupportedBy />
      <CallToAction />
    </div>
  )
}

export default HomePage
