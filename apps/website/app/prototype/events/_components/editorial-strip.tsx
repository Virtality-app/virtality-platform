import Link from 'next/link'
import SeeAllLink from './see-all-link'
import PrototypeCover from './prototype-cover'
import { formatItemDate, placeLabel } from './prototype-items'
import type { PrototypeStripProps } from './prototype-strip-types'

/** D: a short meta-rail list, the same rows as /blog in miniature. */
const EditorialStrip = ({
  heading,
  items,
  seeAllHref,
  seeAllLabel,
}: PrototypeStripProps) => {
  if (items.length === 0) return null

  return (
    <section className='bg-white dark:bg-zinc-900'>
      <div className='container mx-auto grid gap-8 px-4 py-14 md:grid-cols-[180px_1fr] md:px-8 md:py-20'>
        <div className='space-y-4'>
          <h2 className='text-2xl font-bold tracking-tight md:text-3xl'>
            {heading}
          </h2>
          <SeeAllLink href={seeAllHref} label={seeAllLabel} />
        </div>
        <ul className='border-t border-slate-300/70 dark:border-zinc-800'>
          {items.map((item) => {
            const place = placeLabel(item)
            return (
              <li
                key={item.slug}
                className='border-b border-slate-300/70 dark:border-zinc-800'
              >
                <Link
                  href={item.href}
                  className='group grid gap-4 py-6 sm:grid-cols-[150px_minmax(0,1fr)_120px] sm:items-center sm:gap-6'
                >
                  <div className='space-y-1 font-mono text-xs tracking-wide text-slate-500 uppercase'>
                    <p>{formatItemDate(item)}</p>
                    {place ? (
                      <p className='text-vital-blue-700'>{place}</p>
                    ) : null}
                  </div>
                  <div>
                    <h3 className='group-hover:text-vital-blue-700 text-lg font-medium text-balance transition-colors md:text-xl'>
                      {item.title}
                    </h3>
                    <p className='mt-1 line-clamp-1 text-sm text-slate-600 dark:text-slate-400'>
                      {item.excerpt}
                    </p>
                  </div>
                  <PrototypeCover
                    item={item}
                    sizes='(max-width: 639px) calc(100vw - 2rem), 120px'
                    className='hidden aspect-[4/3] sm:block'
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export default EditorialStrip
