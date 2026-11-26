import ContactPage from '@/sections/contact'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata = buildPageMetadata({
  title: 'Contact',
  description:
    'Contact Virtality about VR rehabilitation for your clinic. Email info@virtality.app or send us a message.',
  path: '/contact',
})

const ContactRoute = () => {
  return <ContactPage />
}

export default ContactRoute
