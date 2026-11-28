import { cn } from '@/lib/utils'
import IndexHeader from './index-header'
import GalleryTile from './gallery-tile'
import type { PrototypeIndexProps } from './prototype-strip-types'

/** B: a Cover grid; the newest event takes a 2×2 tile. */
const GalleryIndex = ({ events }: PrototypeIndexProps) => (
  <div className='min-h-screen bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-slate-100'>
    <IndexHeader
      title='Where we have been'
      lead='Conferences, showcases and seminars where the team presented Virtality, newest first.'
    />
    <div className='container mx-auto grid auto-rows-[260px] gap-4 px-4 py-12 sm:grid-cols-2 md:px-8 lg:grid-cols-3'>
      {events.map((event, index) => (
        <GalleryTile
          key={event.slug}
          item={event}
          large={index === 0}
          sizes={
            index === 0
              ? '(max-width: 639px) calc(100vw - 2rem), 66vw'
              : '(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) 50vw, 33vw'
          }
          className={cn(index === 0 && 'sm:col-span-2 sm:row-span-2')}
        />
      ))}
    </div>
  </div>
)

export default GalleryIndex
