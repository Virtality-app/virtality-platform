import type { MosaicTileListItem } from '@virtality/shared/types'

export type MosaicTileImage = {
  src: string
  alt: string
}

export function getMosaicImageTileProps(
  tile: Pick<MosaicTileListItem, 'mediaKind' | 'cdnUrl' | 'alt'>,
): MosaicTileImage | null {
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
