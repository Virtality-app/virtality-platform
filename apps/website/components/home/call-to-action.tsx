'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Users } from 'lucide-react'
import { useWaitlist } from '@virtality/react-query'
import { Button } from '@virtality/ui/components/button'
import { Card, CardContent } from '@virtality/ui/components/card'
import { Spinner } from '@virtality/ui/components/spinner'
import WaitlistForm from '../call-to-action/waitlist-form'
import {
  CTA_TRUST_POINTS,
  FINAL_CTA_BOOK_DEMO_LABEL,
  FINAL_CTA_JOIN_WAITLIST_LABEL,
} from '@/lib/cta-content'
import { getDemoBookingUrl } from '@/lib/demo-booking'
import { formatWaitlistSocialProofCount } from '@/lib/waitlist-count'

const demoBookingUrl = getDemoBookingUrl()

const CallToAction = () => {
  const { data: waitlist, isLoading } = useWaitlist()
  const [showWaitlistForm, setShowWaitlistForm] = useState(false)

  return (
    <section id='cta' className='relative py-24 overflow-hidden'>
      {/* Background */}
      <div className='absolute inset-0 bg-linear-to-br from-slate-50 via-vital-blue-50/30 to-white'></div>
      <div
        className='absolute inset-0 opacity-[0.02]'
        style={{
          backgroundImage: `
            radial-gradient(circle at 2px 2px, #08899a 1px, transparent 0)
          `,
          backgroundSize: '32px 32px',
        }}
      ></div>

      {/* Decorative elements */}
      <div className='absolute top-0 left-0 w-96 h-96 bg-vital-blue-400/10 rounded-full blur-3xl'></div>
      <div className='absolute bottom-0 right-0 w-96 h-96 bg-vital-blue-600/10 rounded-full blur-3xl'></div>

      <div className='container relative z-10 m-auto px-4 md:px-8'>
        <Card className='w-full max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border-2 border-vital-blue-100/50 shadow-2xl overflow-hidden'>
          <CardContent className='p-0'>
            {/* Top accent bar */}
            <div className='h-2 bg-linear-to-r from-vital-blue-700 via-vital-blue-600 to-vital-blue-700'></div>

            <div className='p-8 md:p-12'>
              <div className='text-center mb-10'>
                <div className='inline-flex items-center gap-2 rounded-full bg-linear-to-r from-vital-blue-700 to-vital-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-vital-blue-700/20 mb-6'>
                  <span>Early Access Program</span>
                </div>

                <h2 className='text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight'>
                  Join the Future of{' '}
                  <span className='bg-linear-to-r from-vital-blue-700 to-vital-blue-600 bg-clip-text text-transparent'>
                    Clinical Rehabilitation
                  </span>
                </h2>

                <p className='text-slate-600 text-lg leading-relaxed max-w-2xl mx-auto'>
                  Be among the first healthcare professionals to access our
                  clinical-grade VR rehabilitation platform and transform your
                  patient outcomes.
                </p>
              </div>

              <div className='mx-auto max-w-2xl space-y-8'>
                <div className='flex flex-col gap-4 sm:flex-row'>
                  <Button
                    type='button'
                    variant='primary'
                    className='h-auto flex-1 px-6 py-4 text-base font-semibold shadow-lg shadow-vital-blue-700/25 hover:shadow-xl hover:shadow-vital-blue-700/30 transition-all'
                    onClick={() => setShowWaitlistForm(true)}
                  >
                    {FINAL_CTA_JOIN_WAITLIST_LABEL}
                  </Button>

                  <Button
                    asChild
                    variant='outline'
                    className='h-auto flex-1 px-6 py-4 text-base font-semibold border-2 border-vital-blue-700 text-vital-blue-700 hover:bg-vital-blue-50'
                  >
                    <Link
                      href={demoBookingUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      {FINAL_CTA_BOOK_DEMO_LABEL}
                    </Link>
                  </Button>
                </div>

                {showWaitlistForm && <WaitlistForm />}
              </div>

              <div className='mt-10 grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto'>
                {CTA_TRUST_POINTS.map((point) => (
                  <div
                    key={point}
                    className='flex items-start gap-3 rounded-xl border border-vital-blue-100 bg-vital-blue-50/40 px-4 py-3 text-left'
                  >
                    <Check className='mt-0.5 h-5 w-5 shrink-0 text-vital-blue-700' />
                    <span className='text-sm font-medium text-slate-700'>
                      {point}
                    </span>
                  </div>
                ))}
              </div>

              <div className='mt-10 border-t border-vital-blue-100 pt-10'>
                <div className='mx-auto max-w-sm text-center group'>
                  <div className='mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-vital-blue-700 to-vital-blue-600 shadow-lg shadow-vital-blue-700/20 transition-transform group-hover:scale-110'>
                    <Users className='h-6 w-6 text-white' />
                  </div>
                  <div className='mb-1 text-3xl font-bold text-vital-blue-700'>
                    <div className='flex items-center justify-center'>
                      {isLoading ? (
                        <Spinner className='size-9' />
                      ) : (
                        formatWaitlistSocialProofCount(waitlist?.length ?? 0)
                      )}
                    </div>
                  </div>
                  <div className='text-sm font-medium text-slate-600'>
                    Healthcare Professionals
                  </div>
                  <div className='mt-1 text-xs text-slate-500'>
                    in early access program
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default CallToAction
