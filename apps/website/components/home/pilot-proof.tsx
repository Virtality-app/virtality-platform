import { Clock3, Target, type LucideIcon } from 'lucide-react'
import {
  PILOT_PROOF_CONTENT,
  type PilotProofIconName,
} from '@/lib/landing-page-content'

const pilotProofIcons: Record<PilotProofIconName, LucideIcon> = {
  Clock3,
  Target,
}

const PilotProof = () => {
  return (
    <section id='pilot-proof' className='relative overflow-hidden py-20'>
      <div className='absolute inset-0 bg-linear-to-br from-vital-blue-50/60 via-white to-slate-50'></div>
      <div
        className='absolute inset-0 opacity-[0.02]'
        style={{
          backgroundImage: `
            radial-gradient(circle at 2px 2px, #08899a 1px, transparent 0)
          `,
          backgroundSize: '48px 48px',
        }}
      ></div>

      <div className='container relative z-10 m-auto px-4 md:px-8'>
        <div className='mx-auto max-w-4xl text-center'>
          <div className='mb-6 inline-flex items-center gap-2 rounded-full bg-vital-blue-700/10 px-4 py-2 text-sm font-semibold text-vital-blue-700'>
            <span>{PILOT_PROOF_CONTENT.eyebrow}</span>
          </div>
          <h2 className='mb-6 text-4xl font-bold text-slate-900 md:text-5xl dark:text-white'>
            {PILOT_PROOF_CONTENT.title}
          </h2>
          <p className='text-lg leading-relaxed text-slate-600 dark:text-gray-300'>
            {PILOT_PROOF_CONTENT.intro}
          </p>
        </div>

        <div className='mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-2'>
          {PILOT_PROOF_CONTENT.highlights.map((highlight) => {
            const Icon = pilotProofIcons[highlight.icon]

            return (
              <div
                key={highlight.title}
                className='rounded-2xl border border-vital-blue-100/70 bg-white/90 p-8 shadow-lg shadow-vital-blue-700/5 backdrop-blur-sm'
              >
                <div className='mb-5 inline-flex size-12 items-center justify-center rounded-xl bg-linear-to-br from-vital-blue-700 to-vital-blue-600 text-white shadow-md'>
                  <Icon className='size-6' />
                </div>
                <h3 className='mb-3 text-2xl font-bold text-slate-900 dark:text-white'>
                  {highlight.title}
                </h3>
                <p className='leading-relaxed text-slate-600 dark:text-gray-300'>
                  {highlight.description}
                </p>
              </div>
            )
          })}
        </div>

        <p className='mx-auto mt-10 max-w-3xl text-center text-sm leading-relaxed text-slate-500'>
          {PILOT_PROOF_CONTENT.disclaimer}
        </p>
      </div>
    </section>
  )
}

export default PilotProof
