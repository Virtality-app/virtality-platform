import type { PrototypeItem } from './prototype-items'

/** The shared "latest 3" strip from CORE-418, reused for events by CORE-419. */
export type PrototypeStripProps = {
  heading: string
  items: PrototypeItem[]
  seeAllHref: string
  seeAllLabel: string
}

export type PrototypeIndexProps = {
  events: PrototypeItem[]
}
