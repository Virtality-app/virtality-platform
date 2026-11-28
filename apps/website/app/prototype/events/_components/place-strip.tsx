import SeeAllLink from './see-all-link'
import PlaceCard from './place-card'
import type { PrototypeStripProps } from './prototype-strip-types'

/** C: three place cards in a row. */
const PlaceStrip = ({
  heading,
  items,
  seeAllHref,
  seeAllLabel,
}: PrototypeStripProps) => {
  if (items.length === 0) return null

  return (
    <section className='bg-linear-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-zinc-900'>
      <div className='container mx-auto px-4 py-14 md:px-8 md:py-20'>
        <div className='flex flex-wrap items-end justify-between gap-4'>
          <h2 className='text-3xl font-bold tracking-tight md:text-4xl'>
            {heading}
          </h2>
          <SeeAllLink href={seeAllHref} label={seeAllLabel} />
        </div>
        <ul className='mt-10 grid gap-6 md:grid-cols-3'>
          {items.map((item) => (
            <li key={item.slug}>
              <PlaceCard item={item} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default PlaceStrip
