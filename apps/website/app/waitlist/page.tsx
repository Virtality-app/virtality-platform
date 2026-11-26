import Waitlist from '@/sections/waitlist'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata = buildPageMetadata({
  title: 'Join the waitlist',
  description:
    'Join the Virtality waitlist for early access to VR rehabilitation for your clinic and special launch pricing.',
  path: '/waitlist',
})

const WaitlistPage = () => {
  return <Waitlist />
}

export default WaitlistPage
