// PROTOTYPE (CORE-418 + CORE-419). Throwaway: delete with the /prototype/events route.
//
// Stands in for the future `kind`, `eventDate` and `location` fields on a Post.
// Every value below comes from the Post's own excerpt or body text. A field is
// null when the text doesn't say, so the layouts show how they cope with gaps.
import type { ResolvedPost } from '@/sections/blog'

export type PrototypeItem = {
  slug: string
  href: string
  kind: 'post' | 'event'
  title: string
  excerpt: string
  cover: string
  coverFocusY: number
  publishedAt: string
  /** Day of the event. Falls back to publishedAt when the text gives no date. */
  eventDate: string | null
  eventEndDate: string | null
  eventName: string | null
  city: string | null
  country: string | null
  venue: string | null
  partner: string | null
}

type EventMeta = Partial<
  Pick<
    PrototypeItem,
    | 'eventDate'
    | 'eventEndDate'
    | 'eventName'
    | 'city'
    | 'country'
    | 'venue'
    | 'partner'
  >
>

// Slugs not listed here are treated as `post`.
const EVENT_META: Record<string, EventMeta> = {
  'vivatech-2026': {
    eventName: 'Viva Technology 2026',
    city: 'Paris',
    country: 'FR',
    partner: 'WE4G · HEC Paris',
  },
  'beyond-expo-2026': {
    eventName: 'BEYOND Expo 2026',
    eventDate: '2026-06-17',
    eventEndDate: '2026-06-19',
    city: 'Athens',
    country: 'GR',
    venue: 'Startup Village (Hall 3) and the Region of Crete pavilion',
    partner: 'Region of Crete',
  },
  'panathenea-startup-showcase': {
    eventName: 'Panathēnea',
    venue: 'Piraeus Bank pavilion',
    partner: 'Piraeus Bank',
  },
  'delphi-economic-forum': {
    eventName: 'Delphi Economic Forum XI',
    city: 'Delphi',
    country: 'GR',
    venue: 'Amalia Hotel, Ermis Hall',
    partner: 'Piraeus Bank',
  },
  'physiotherapy-seminar-acl': {
    eventName: 'ACL rehabilitation seminar',
    venue: 'Hosted by a pilot clinic',
  },
  'piraeus-startup-accelerator-xanthi': {
    eventName: 'Piraeus Startup Accelerator kickoff',
    city: 'Xanthi',
    country: 'GR',
    partner: 'Piraeus Startup Accelerator',
  },
  'innodays-crete': {
    eventName: 'InnoDays Crete',
    city: 'Crete',
    country: 'GR',
    venue: 'Booth Δ07',
  },
  'panhellenic-physiotherapy-conference': {
    eventName: '2nd Scientific Physiotherapy Conference',
    city: 'Crete',
    country: 'GR',
  },
}

export function toPrototypeItems(posts: ResolvedPost[]) {
  const items = posts.map((post): PrototypeItem => {
    const meta = EVENT_META[post.slug]
    return {
      slug: post.slug,
      href: `/blog/${post.slug}`,
      kind: meta ? 'event' : 'post',
      title: post.title,
      excerpt: post.excerpt,
      cover: post.cover,
      coverFocusY: Math.min(100, Math.max(0, post.coverFocusY ?? 50)),
      publishedAt: post.publishedAt,
      eventDate: meta?.eventDate ?? null,
      eventEndDate: meta?.eventEndDate ?? null,
      eventName: meta?.eventName ?? null,
      city: meta?.city ?? null,
      country: meta?.country ?? null,
      venue: meta?.venue ?? null,
      partner: meta?.partner ?? null,
    }
  })

  const byDateDesc = (a: PrototypeItem, b: PrototypeItem) =>
    itemDate(b).localeCompare(itemDate(a))

  return {
    posts: items.filter((item) => item.kind === 'post').sort(byDateDesc),
    events: items.filter((item) => item.kind === 'event').sort(byDateDesc),
  }
}

export function itemDate(item: PrototypeItem): string {
  return item.eventDate ?? item.publishedAt
}

export function placeLabel(item: PrototypeItem): string | null {
  const parts = [item.city, item.country].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : null
}

function toDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`)
}

const longDate = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

const shortDate = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

/** "June 17–19, 2026", or one day when there is no end date. */
export function formatItemDate(item: PrototypeItem): string {
  const start = itemDate(item)
  if (!item.eventEndDate) return longDate.format(toDate(start))
  const end = toDate(item.eventEndDate)
  const startParts = longDate.formatToParts(toDate(start))
  const month = startParts.find((part) => part.type === 'month')?.value
  const day = startParts.find((part) => part.type === 'day')?.value
  return `${month} ${day}–${end.getUTCDate()}, ${end.getUTCFullYear()}`
}

/** "Jun 17" */
export function formatShortItemDate(item: PrototypeItem): string {
  return shortDate.format(toDate(itemDate(item)))
}

export function itemYear(item: PrototypeItem): string {
  return itemDate(item).slice(0, 4)
}
