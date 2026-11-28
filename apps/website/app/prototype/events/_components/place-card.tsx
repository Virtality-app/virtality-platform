import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import PrototypeCover from './prototype-cover'
import { formatItemDate, type PrototypeItem } from './prototype-items'

type PlaceCardProps = {
  item: PrototypeItem
  showExcerpt?: boolean
}

/** C: where it happened and who hosted it come before what was said. */
const PlaceCard = ({ item, showExcerpt }: PlaceCardProps) => {
  // Posts and events without a city fall back to the event name, then the date.
  const place = item.city ?? item.eventName ?? formatItemDate(item)

  return (
    <Link
      href={item.href}
      className='group border-vital-blue-100 flex h-full flex-col rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900'
    >
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0'>
          <p className='flex items-center gap-1.5 font-mono text-xs tracking-[0.18em] text-slate-500 uppercase'>
            <MapPin className='size-3.5' />
            {item.country ?? (item.kind === 'post' ? 'Blog' : 'Event')}
          </p>
          <h3
            className={cn(
              'mt-1 font-bold tracking-tight text-balance',
              item.city ? 'text-3xl' : 'text-2xl',
            )}
          >
            {place}
          </h3>
        </div>
        <PrototypeCover
          item={item}
          sizes='72px'
          className='size-18 shrink-0 rounded-lg'
        />
      </div>

      <dl className='mt-4 mb-5 space-y-1 text-sm'>
        {item.venue ? (
          <div className='flex gap-2'>
            <dt className='sr-only'>Venue</dt>
            <dd className='text-slate-700 dark:text-slate-300'>{item.venue}</dd>
          </div>
        ) : null}
        {item.partner ? (
          <div className='flex gap-2'>
            <dt className='text-slate-500'>With</dt>
            <dd className='text-vital-blue-800 dark:text-vital-blue-300 font-semibold'>
              {item.partner}
            </dd>
          </div>
        ) : null}
      </dl>

      <div className='mt-auto border-t border-slate-200 pt-4 dark:border-zinc-800'>
        <p className='mt-4 font-mono text-xs tracking-[0.18em] text-slate-500 uppercase'>
          {formatItemDate(item)}
        </p>
        <p className='group-hover:text-vital-blue-700 mt-2 font-semibold text-balance transition-colors'>
          {item.title}
        </p>
        {showExcerpt ? (
          <p className='mt-2 text-sm text-pretty text-slate-600 dark:text-slate-400'>
            {item.excerpt}
          </p>
        ) : null}
      </div>
    </Link>
  )
}

export default PlaceCard
