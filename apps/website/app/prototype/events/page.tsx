// PROTOTYPE (CORE-418 + CORE-419): four layouts for the Events page and the
// home "latest 3" strip, switchable via ?variant=A|B|C|D and ?view=home|events.
// Real Posts from the API; event fields are stand-ins (see prototype-items.ts).
// Throwaway: pick a variant, then delete this route and prototype-switcher.tsx.
// Never merge this branch.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import PrototypeSwitcher from '@/components/shared/prototype-switcher'
import { prefetchMarketingHomeQueries } from '@/lib/marketing-prefetch'
import { getPosts } from '@/sections/blog'
import HomePreview from './_components/home-preview'
import { toPrototypeItems } from './_components/prototype-items'
import { PROTOTYPE_VARIANTS } from './_components/prototype-variants'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Events prototype',
  robots: { index: false, follow: false },
}

const VIEWS = [
  { key: 'home', name: 'Home strips' },
  { key: 'events', name: '/events page' },
]

type EventsPrototypePageProps = {
  searchParams: Promise<{ variant?: string; view?: string }>
}

const EventsPrototypePage = async ({
  searchParams,
}: EventsPrototypePageProps) => {
  // Shown locally and on PR previews; never on the production site.
  if (process.env.NEXT_PUBLIC_ENV === 'production') notFound()

  const params = await searchParams
  const variant =
    PROTOTYPE_VARIANTS.find((item) => item.key === params.variant) ??
    PROTOTYPE_VARIANTS[0]
  const view = params.view === 'events' ? 'events' : 'home'

  const [queryClient, allPosts] = await Promise.all([
    prefetchMarketingHomeQueries(),
    getPosts(),
  ])
  const { posts, events } = toPrototypeItems(allPosts)
  const { Strip, Index } = variant

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {view === 'home' ? (
        <HomePreview Strip={Strip} posts={posts} events={events} />
      ) : (
        <Index events={events} />
      )}
      <PrototypeSwitcher
        variants={PROTOTYPE_VARIANTS.map(({ key, name }) => ({ key, name }))}
        current={variant.key}
        views={VIEWS}
        currentView={view}
        status={`${events.length} events · ${posts.length} posts · ← → to switch`}
      />
    </HydrationBoundary>
  )
}

export default EventsPrototypePage
