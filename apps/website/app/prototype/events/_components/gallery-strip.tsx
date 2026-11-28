import SeeAllLink from './see-all-link'
import GalleryTile from './gallery-tile'
import type { PrototypeStripProps } from './prototype-strip-types'

/** B: three tall photo tiles, no text outside the pictures. */
const GalleryStrip = ({
  heading,
  items,
  seeAllHref,
  seeAllLabel,
}: PrototypeStripProps) => {
  if (items.length === 0) return null

  return (
    <section className='bg-slate-50 dark:bg-zinc-950'>
      <div className='container mx-auto px-4 py-14 md:px-8 md:py-20'>
        <h2 className='text-center text-3xl font-bold tracking-tight md:text-4xl'>
          {heading}
        </h2>
        <div className='mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {items.map((item) => (
            <GalleryTile
              key={item.slug}
              item={item}
              sizes='(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) 50vw, 33vw'
              className='aspect-[4/5]'
            />
          ))}
        </div>
        <div className='mt-8 text-center'>
          <SeeAllLink href={seeAllHref} label={seeAllLabel} />
        </div>
      </div>
    </section>
  )
}

export default GalleryStrip
