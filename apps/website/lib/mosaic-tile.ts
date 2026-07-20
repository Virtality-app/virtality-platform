import type { MosaicTileListItem } from '@virtality/shared/types'

export type MosaicImageTileProps = {
  src: string
  alt: string
}

export const MOSAIC_GRID_MOBILE_SCALE_CLASS =
  'mx-auto w-full max-w-3xl origin-top scale-[0.82] sm:scale-100'

export function getMosaicImageTileProps(
  tile: Pick<MosaicTileListItem, 'mediaKind' | 'cdnUrl' | 'alt'>,
): MosaicImageTileProps | null {
  if (tile.mediaKind !== 'image') {
    return null
  }

  const src = tile.cdnUrl.trim()
  const alt = tile.alt.trim()

  if (!src || !alt) {
    return null
  }

  return { src, alt }
}
