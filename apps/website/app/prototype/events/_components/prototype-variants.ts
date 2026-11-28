import type { ComponentType } from 'react'
import TimelineStrip from './timeline-strip'
import TimelineIndex from './timeline-index'
import GalleryStrip from './gallery-strip'
import GalleryIndex from './gallery-index'
import PlaceStrip from './place-strip'
import PlaceIndex from './place-index'
import EditorialStrip from './editorial-strip'
import EditorialIndex from './editorial-index'
import type {
  PrototypeIndexProps,
  PrototypeStripProps,
} from './prototype-strip-types'

type PrototypeVariant = {
  key: string
  name: string
  Strip: ComponentType<PrototypeStripProps>
  Index: ComponentType<PrototypeIndexProps>
}

export const PROTOTYPE_VARIANTS: PrototypeVariant[] = [
  { key: 'A', name: 'Timeline', Strip: TimelineStrip, Index: TimelineIndex },
  { key: 'B', name: 'Photo gallery', Strip: GalleryStrip, Index: GalleryIndex },
  { key: 'C', name: 'Place-led cards', Strip: PlaceStrip, Index: PlaceIndex },
  {
    key: 'D',
    name: 'Editorial',
    Strip: EditorialStrip,
    Index: EditorialIndex,
  },
]
