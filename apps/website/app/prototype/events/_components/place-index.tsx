import IndexHeader from './index-header'
import PlaceCard from './place-card'
import type { PrototypeIndexProps } from './prototype-strip-types'

/** C: a row of places visited, then a card per event. */
const PlaceIndex = ({ events }: PrototypeIndexProps) => {
  const places = new Map<string, number>()
  for (const event of events) {
    const place = event.city ?? 'Other'
    places.set(place, (places.get(place) ?? 0) + 1)
  }

  return (
    <div className='min-h-screen bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-slate-100'>
      <IndexHeader
        title='Where we have been'
        lead='Conferences, showcases and seminars where the team presented Virtality, newest first.'
      />
      <div className='container mx-auto px-4 py-12 md:px-8'>
        <ul className='flex flex-wrap gap-2'>
          {[...places].map(([place, count]) => (
            <li
              key={place}
              className='border-vital-blue-100 rounded-full border bg-white px-4 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-900'
            >
              <span className='font-semibold'>{place}</span>
              <span className='ml-2 text-slate-500'>{count}</span>
            </li>
          ))}
        </ul>
        <ul className='mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {events.map((event) => (
            <li key={event.slug}>
              <PlaceCard item={event} showExcerpt />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default PlaceIndex
