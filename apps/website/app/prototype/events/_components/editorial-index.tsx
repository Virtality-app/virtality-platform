import Link from 'next/link'
import IndexHeader from './index-header'
import PrototypeCover from './prototype-cover'
import EventDetailsBlock from './event-details-block'
import type { PrototypeIndexProps } from './prototype-strip-types'

/** D: the /blog meta-rail, with Event details in the rail. */
const EditorialIndex = ({ events }: PrototypeIndexProps) => (
  <div className='min-h-screen bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-slate-100'>
    <IndexHeader
      title='Where we have been'
      lead='Conferences, showcases and seminars where the team presented Virtality, newest first.'
    />
    <ul className='container mx-auto px-4 md:px-8'>
      {events.map((event) => (
        <li
          key={event.slug}
          className='border-b border-slate-300/70 dark:border-zinc-800'
        >
          <Link
            href={event.href}
            className='group grid gap-6 py-12 md:grid-cols-[180px_minmax(0,1fr)_240px] md:items-start md:gap-8 lg:grid-cols-[180px_minmax(0,1fr)_320px]'
          >
            <EventDetailsBlock item={event} />
            <div>
              {event.eventName ? (
                <p className='text-vital-blue-700 font-mono text-xs tracking-[0.18em] uppercase'>
                  {event.eventName}
                </p>
              ) : null}
              <h2 className='group-hover:text-vital-blue-700 mt-2 text-2xl font-medium text-balance transition-colors md:text-3xl'>
                {event.title}
              </h2>
              <p className='mt-3 max-w-2xl text-pretty text-slate-600 dark:text-slate-400'>
                {event.excerpt}
              </p>
            </div>
            <PrototypeCover
              item={event}
              sizes='(max-width: 767px) calc(100vw - 2rem), (max-width: 1023px) 240px, 320px'
              className='aspect-[4/3]'
            />
          </Link>
        </li>
      ))}
    </ul>
  </div>
)

export default EditorialIndex
