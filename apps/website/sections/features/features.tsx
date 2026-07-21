'use client'

import HighlightCard from '@/components/shared/highlight-card'
import { useHighlightCards } from '@virtality/react-query'
import { shouldShowHighlightCardGrid } from '@/components/shared/lib/highlight-card-grid'

const Features = () => {
  const { data: highlightCards, isPending } = useHighlightCards('features')
  const showHighlightCardGrid =
    !isPending && shouldShowHighlightCardGrid(highlightCards)

  return (
    <section
      id='features'
      className='relative dark:bg-zinc-900 flex py-24 overflow-hidden'
    >
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
            <span>Platform Capabilities</span>
          </div>
          <h2 className='mb-6 text-4xl font-bold md:text-5xl text-slate-900 dark:text-white'>
            Clinical Features for{' '}
            <span className='bg-linear-to-r from-vital-blue-700 to-vital-blue-600 bg-clip-text text-transparent'>
              Modern Healthcare
            </span>
          </h2>
          <p className='text-lg leading-relaxed text-slate-600 dark:text-gray-300'>
            Advanced VR platform equipped with comprehensive tools to enhance
            rehabilitation therapy, accelerate patient recovery, and deliver
            measurable clinical outcomes.
          </p>
        </div>

        {showHighlightCardGrid ? (
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto'>
            {highlightCards?.map((card, index) => (
              <HighlightCard
                key={card.id}
                title={card.title}
                body={card.body}
                iconName={card.iconName}
                index={index}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default Features
