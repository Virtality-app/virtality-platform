import FeatureCard from '@/components/home/feature-card'
import {
  BENEFITS_SECTION_CONTENT,
  LANDING_BENEFITS,
} from '@/lib/landing-page-content'

const BenefitsGrid = () => {
  return (
    <section
      id='benefits-grid'
      className='relative dark:bg-zinc-900 flex py-24 overflow-hidden'
    >
      {/* Background with medical motif */}
      <div className='absolute inset-0 bg-linear-to-b from-slate-50 via-white to-vital-blue-50/20'></div>
      <div
        className='absolute inset-0 opacity-[0.02]'
        style={{
          backgroundImage: `
            radial-gradient(circle at 2px 2px, #08899a 1px, transparent 0)
          `,
          backgroundSize: '48px 48px',
        }}
      ></div>

      <div className='container relative z-10 m-auto px-4 md:px-8 py-16'>
        <div className='mx-auto mb-16 max-w-3xl text-center'>
          <div className='inline-flex items-center gap-2 rounded-full bg-vital-blue-700/10 px-4 py-2 text-sm font-semibold text-vital-blue-700 mb-6'>
            <span>{BENEFITS_SECTION_CONTENT.eyebrow}</span>
          </div>
          <h2 className='mb-6 text-4xl font-bold md:text-5xl text-slate-900 dark:text-white'>
            {BENEFITS_SECTION_CONTENT.titleLead}{' '}
            <span className='bg-linear-to-r from-vital-blue-700 to-vital-blue-600 bg-clip-text text-transparent'>
              {BENEFITS_SECTION_CONTENT.titleAccent}
            </span>
          </h2>
          <p className='text-lg leading-relaxed text-slate-600 dark:text-gray-300'>
            {BENEFITS_SECTION_CONTENT.intro}
          </p>
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto'>
          {LANDING_BENEFITS.map((benefit, index) => (
            <FeatureCard
              key={benefit.title}
              title={benefit.title}
              ctx={benefit.description}
              icon={benefit.icon}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default BenefitsGrid
