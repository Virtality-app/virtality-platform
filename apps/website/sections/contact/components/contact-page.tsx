'use client'
import { useState } from 'react'
import ContactForm from './contact-form'
import ContactInfoCard from './contact-info-card'
import ContactSubmitted from './contact-submitted'

const ContactPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false)

  if (isSubmitted) {
    return <ContactSubmitted onReset={() => setIsSubmitted(false)} />
  }

  return (
    <section className='min-h-screen-with-nav flex justify-center bg-linear-to-br from-slate-50 to-white max-lg:py-10'>
      <div className='m-auto'>
        <div className='mb-6 text-center'>
          <div className='bg-vital-blue-700/10 text-vital-blue-700 mb-6 inline-block rounded-full px-4 py-2 text-sm font-medium'>
            Get In Touch
          </div>
          <h1 className='mb-6 text-4xl font-bold text-gray-900 md:text-5xl'>
            Contact <span className='text-vital-blue-700'>Virtality</span>
          </h1>
          <p className='mx-auto max-w-2xl text-lg text-gray-600'>
            {
              "Ready to transform patient recovery with VR technology? We'd love to hear from you. Reach out to learn more about our innovative rehabilitation solutions."
            }
          </p>
        </div>
        <div className='grid gap-8 lg:grid-cols-3'>
          <div className='lg:col-span-2'>
            <ContactForm onSubmitted={() => setIsSubmitted(true)} />
          </div>
          <div className='space-y-6'>
            <ContactInfoCard />
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactPage
