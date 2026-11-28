import Link from 'next/link'
import { cn } from '@/lib/utils'
import PrototypeCover from './prototype-cover'
import {
  formatItemDate,
  placeLabel,
  type PrototypeItem,
} from './prototype-items'

type GalleryTileProps = {
  item: PrototypeItem
  sizes: string
  large?: boolean
  className?: string
}

/** B: the Cover fills the tile; title and place sit on a dark scrim. */
const GalleryTile = ({ item, sizes, large, className }: GalleryTileProps) => {
  const place = placeLabel(item)

  return (
    <Link
      href={item.href}
      className={cn(
        'group relative block overflow-hidden rounded-xl shadow-sm',
        className,
      )}
    >
      <PrototypeCover item={item} sizes={sizes} className='absolute inset-0' />
      <div className='absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-950/20 to-transparent' />
      {place ? (
        <span className='absolute top-4 left-4 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-slate-900 backdrop-blur-sm'>
          {place}
        </span>
      ) : null}
      <div className='absolute inset-x-0 bottom-0 p-5 text-white md:p-6'>
        <p className='font-mono text-xs tracking-[0.18em] text-white/70 uppercase'>
          {formatItemDate(item)}
        </p>
        <h3
          className={cn(
            'mt-2 font-semibold text-balance',
            large ? 'text-2xl md:text-3xl' : 'text-lg',
          )}
        >
          {item.title}
        </h3>
        {large ? (
          <p className='mt-2 line-clamp-2 max-w-xl text-pretty text-white/80'>
            {item.excerpt}
          </p>
        ) : null}
      </div>
    </Link>
  )
}

export default GalleryTile
