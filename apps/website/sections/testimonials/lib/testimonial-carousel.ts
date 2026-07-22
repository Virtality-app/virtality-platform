import type { CarouselApi } from '@/components/ui/carousel'

/** Lower middle for even counts (e.g. 4 → 1). */
export function getClosestMiddleIndex(count: number): number {
  if (count <= 0) {
    return 0
  }

  return Math.floor((count - 1) / 2)
}

export function scrollCarouselWithWrap(
  api: CarouselApi | undefined,
  direction: 'next' | 'prev',
): void {
  if (!api) {
    return
  }

  if (direction === 'next') {
    if (api.canScrollNext()) {
      api.scrollNext()
      return
    }

    api.scrollTo(0)
    return
  }

  if (api.canScrollPrev()) {
    api.scrollPrev()
    return
  }

  api.scrollTo(api.scrollSnapList().length - 1)
}
