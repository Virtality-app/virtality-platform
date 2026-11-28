import type { ComponentType } from 'react'
import Benefits from '@/sections/benefits'
import SupportedBy from '@/sections/supported-by'
import type { PrototypeItem } from './prototype-items'
import type { PrototypeStripProps } from './prototype-strip-types'

type HomePreviewProps = {
  Strip: ComponentType<PrototypeStripProps>
  posts: PrototypeItem[]
  events: PrototypeItem[]
}

/** Both strips in their planned home slot: after Benefits, before Supported by. */
const HomePreview = ({ Strip, posts, events }: HomePreviewProps) => (
  <div className='bg-white text-slate-900 dark:bg-zinc-900 dark:text-gray-100'>
    <Benefits />
    <Strip
      heading='Latest from the blog'
      items={posts.slice(0, 3)}
      seeAllHref='/blog'
      seeAllLabel='See all posts'
    />
    <Strip
      heading='Latest events'
      items={events.slice(0, 3)}
      seeAllHref='/prototype/events?view=events'
      seeAllLabel='See all events'
    />
    <SupportedBy />
  </div>
)

export default HomePreview
