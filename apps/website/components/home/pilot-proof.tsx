import { PILOT_PROOF_CONTENT } from '@/lib/landing-page-content'

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
        <div className='mx-auto max-w-5xl'>
          <div className='rounded-2xl border border-vital-blue-100/50 bg-white p-8 shadow-xl dark:bg-zinc-800'>
            <div className='grid grid-cols-1 gap-8 divide-y divide-vital-blue-100 text-center md:grid-cols-3 md:divide-x md:divide-y-0'>
              {PILOT_PROOF_CONTENT.metrics.map((metric) => (
                <div key={metric.label} className='pt-8 md:pt-0 md:px-4'>
                  <div className='mb-2 text-4xl font-bold text-vital-blue-700'>
                    {metric.value}
                  </div>
                  <div className='text-sm font-medium text-slate-600 dark:text-gray-300'>
                    {metric.label}
                  </div>
                  <div className='mt-1 text-xs text-slate-500'>
                    {metric.caption}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PilotProof
