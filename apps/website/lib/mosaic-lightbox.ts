import type { MosaicTileListItem } from '@virtality/shared/types'
import {
  getMosaicImageTileProps,
  getMosaicVideoTileProps,
} from '@/lib/mosaic-tile'

export type MosaicLightboxImageContent = {
  kind: 'image'
  src: string
  alt: string
}

export type MosaicLightboxVideoContent = {
  kind: 'video'
  src: string
  alt: string
  mimeType?: string
}

export type MosaicLightboxContent =
  | MosaicLightboxImageContent
  | MosaicLightboxVideoContent

export function getMosaicLightboxContent(
  tile: MosaicTileListItem,
): MosaicLightboxContent | null {
  switch (tile.mediaKind) {
    case 'image': {
      const image = getMosaicImageTileProps(tile)

      if (!image) {
        return null
      }

      return {
        kind: 'image',
        src: image.src,
        alt: image.alt,
      }
    }
    case 'video': {
      const video = getMosaicVideoTileProps(tile)

      if (!video) {
        return null
      }

      return {
        kind: 'video',
        src: video.src,
        alt: video.alt,
        mimeType: video.mimeType,
      }
    }
  }
}
