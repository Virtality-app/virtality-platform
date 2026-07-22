import { CheckCircle2 } from 'lucide-react'
import Image from 'next/image'
import { BENEFITS_LIST_ITEMS, BENEFITS_SECTION_CONTENT } from './content'

const Benefits = () => {
  return (
    <section id='benefits' className='relative flex overflow-hidden'>
      <div className='absolute inset-0 bg-linear-to-br from-white via-vital-blue-50/30 to-slate-50'></div>
      <div
        className='absolute inset-0 opacity-[0.015]'
        style={{
          backgroundImage: `
            linear-gradient(135deg, #08899a 1px, transparent 1px),
            linear-gradient(225deg, #08899a 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      ></div>

      <div className='container relative z-10 m-auto px-4 md:px-8 py-20'>
        <div className='grid items-center gap-16 lg:grid-cols-2'>
          <div className='relative order-2 lg:order-1 group'>
            <div className='absolute -inset-6 bg-linear-to-br from-vital-blue-600/20 to-vital-blue-400/10 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
            <div className='absolute -top-8 -left-8 w-32 h-32 border-2 border-vital-blue-600/30 rounded-full'></div>
            <div className='absolute -bottom-8 -right-8 w-40 h-40 border-2 border-vital-blue-500/20 rounded-full'></div>

            <div className='relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-vital-blue-100/50'>
              <Image
                src='https://cdn.virtality.app/2e78ac55ab9e56ef44091705aabeced201df5db4e6c6a92b2133ca556a93bbee'
                alt='Patient using VR for rehabilitation'
                width={600}
                height={600}
                className='relative mx-auto w-full rounded-2xl'
              />
            </div>
          </div>

          <div className='order-1 space-y-8 lg:order-2'>
            <div>
              <div className='inline-flex items-center gap-2 rounded-full bg-vital-blue-700/10 px-4 py-2 text-sm font-semibold text-vital-blue-700 mb-6'>
                <span>{BENEFITS_SECTION_CONTENT.eyebrow}</span>
              </div>
              <h2 className='text-4xl font-bold md:text-5xl text-slate-900 dark:text-white mb-6'>
                {BENEFITS_SECTION_CONTENT.titleLead}{' '}
                <span className='bg-linear-to-r from-vital-blue-700 to-vital-blue-600 bg-clip-text text-transparent'>
                  {BENEFITS_SECTION_CONTENT.titleAccent}
                </span>
              </h2>
              <p className='text-lg leading-relaxed text-slate-600 dark:text-gray-300'>
                {BENEFITS_SECTION_CONTENT.intro}
              </p>
            </div>

            <ul className='space-y-6'>
              {BENEFITS_LIST_ITEMS.map((item) => (
                <li key={item.title} className='flex items-start group'>
                  <div className='mr-4 mt-0.5 shrink-0'>
                    <div className='flex size-10 items-center justify-center rounded-lg bg-linear-to-br from-vital-blue-700 to-vital-blue-600 shadow-md group-hover:scale-110 transition-transform'>
                      <CheckCircle2 className='w-5 h-5 text-white' />
                    </div>
                  </div>
                  <div>
                    <h3 className='text-lg font-bold text-slate-900 dark:text-white mb-2'>
                      {item.title}
                    </h3>
                    <p className='text-slate-600 dark:text-gray-300 leading-relaxed'>
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Benefits
