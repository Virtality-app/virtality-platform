import Link from 'next/link'
import SeeAllLink from './see-all-link'
import PrototypeCover from './prototype-cover'
import { formatItemDate, placeLabel } from './prototype-items'
import type { PrototypeStripProps } from './prototype-strip-types'

/** A: three stops on one horizontal line, date and place before the title. */
const TimelineStrip = ({
  heading,
  items,
  seeAllHref,
  seeAllLabel,
}: PrototypeStripProps) => {
  if (items.length === 0) return null

  return (
    <section className='bg-white dark:bg-zinc-900'>
      <div className='container mx-auto px-4 py-14 md:px-8 md:py-20'>
        <div className='flex flex-wrap items-end justify-between gap-4'>
          <h2 className='text-3xl font-bold tracking-tight md:text-4xl'>
            {heading}
          </h2>
          <SeeAllLink href={seeAllHref} label={seeAllLabel} />
        </div>

        <ol className='relative mt-12 grid gap-10 md:grid-cols-3 md:gap-8'>
          <span
            aria-hidden
            className='bg-vital-blue-100 absolute top-[7px] right-0 left-0 hidden h-px md:block dark:bg-zinc-700'
          />
          {items.map((item) => (
            <li key={item.slug} className='relative'>
              <span
                aria-hidden
                className='border-vital-blue-700 relative z-10 block size-[15px] rounded-full border-2 bg-white dark:bg-zinc-900'
              />
              <Link href={item.href} className='group mt-5 block'>
                <p className='text-vital-blue-700 font-mono text-xs tracking-[0.18em] uppercase'>
                  {formatItemDate(item)}
                </p>
                <p className='mt-1 font-mono text-xs tracking-[0.18em] text-slate-500 uppercase'>
                  {placeLabel(item) ?? item.eventName ?? 'Blog'}
                </p>
                <h3 className='group-hover:text-vital-blue-700 mt-4 text-xl font-semibold text-balance transition-colors'>
                  {item.title}
                </h3>
                <p className='mt-2 line-clamp-2 text-pretty text-slate-600 dark:text-slate-400'>
                  {item.excerpt}
                </p>
                <PrototypeCover
                  item={item}
                  sizes='(max-width: 767px) calc(100vw - 2rem), 33vw'
                  className='mt-5 aspect-[16/9] rounded-lg'
                />
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default TimelineStrip
