import Link from 'next/link'
import IndexHeader from './index-header'
import PrototypeCover from './prototype-cover'
import { formatItemDate, itemYear, placeLabel } from './prototype-items'
import type { PrototypeIndexProps } from './prototype-strip-types'

/** A: one vertical line per year; date and location lead each stop. */
const TimelineIndex = ({ events }: PrototypeIndexProps) => {
  const years = [...new Set(events.map(itemYear))]

  return (
    <div className='min-h-screen bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-slate-100'>
      <IndexHeader
        title='Where we have been'
        lead='Conferences, showcases and seminars where the team presented Virtality, newest first.'
      />
      <div className='container mx-auto px-4 py-12 md:px-8'>
        {years.map((year) => (
          <section
            key={year}
            className='grid gap-6 py-8 md:grid-cols-[160px_1fr] md:gap-10'
          >
            <h2 className='text-5xl font-light tracking-tight text-slate-300 md:sticky md:top-24 md:self-start dark:text-zinc-700'>
              {year}
            </h2>
            <ol className='border-vital-blue-100 border-l dark:border-zinc-800'>
              {events
                .filter((event) => itemYear(event) === year)
                .map((event) => (
                  <li
                    key={event.slug}
                    className='relative pb-12 pl-8 last:pb-0'
                  >
                    <span
                      aria-hidden
                      className='border-vital-blue-700 absolute top-1 -left-[8px] size-[15px] rounded-full border-2 bg-slate-50 dark:bg-zinc-950'
                    />
                    <Link
                      href={event.href}
                      className='group grid gap-5 sm:grid-cols-[minmax(0,1fr)_180px] sm:gap-8'
                    >
                      <div>
                        <p className='text-vital-blue-700 font-mono text-xs tracking-[0.18em] uppercase'>
                          {formatItemDate(event)}
                          {event.eventDate ? null : ' · published'}
                        </p>
                        <p className='mt-1 text-lg font-semibold'>
                          {placeLabel(event) ?? event.eventName}
                          {event.venue ? (
                            <span className='font-normal text-slate-500'>
                              {' '}
                              · {event.venue}
                            </span>
                          ) : null}
                        </p>
                        <h3 className='group-hover:text-vital-blue-700 mt-3 text-2xl font-medium text-balance transition-colors'>
                          {event.title}
                        </h3>
                        <p className='mt-2 max-w-2xl text-pretty text-slate-600 dark:text-slate-400'>
                          {event.excerpt}
                        </p>
                      </div>
                      <PrototypeCover
                        item={event}
                        sizes='(max-width: 639px) calc(100vw - 4rem), 180px'
                        className='aspect-[4/3] rounded-lg'
                      />
                    </Link>
                  </li>
                ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  )
}

export default TimelineIndex
