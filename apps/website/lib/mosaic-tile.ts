import type { MosaicTileListItem } from '@virtality/shared/types'

export type MosaicTileImage = {
  src: string
  alt: string
}

export type MosaicTileVideo = {
  src: string
  alt: string
  mimeType?: string
}

const MOSAIC_VIDEO_MIME_TYPES = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
} as const

export function inferMosaicVideoMimeType(
  objectKey: string,
): string | undefined {
  const extension = objectKey.trim().split('.').pop()?.toLowerCase()

  if (!extension || !(extension in MOSAIC_VIDEO_MIME_TYPES)) {
    return undefined
  }

  return MOSAIC_VIDEO_MIME_TYPES[
    extension as keyof typeof MOSAIC_VIDEO_MIME_TYPES
  ]
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

export function getMosaicVideoTileProps(
  tile: Pick<MosaicTileListItem, 'mediaKind' | 'cdnUrl' | 'alt' | 'objectKey'>,
): MosaicTileVideo | null {
  if (tile.mediaKind !== 'video') {
    return null
  }

  const src = tile.cdnUrl.trim()
  const alt = tile.alt.trim()

  if (!src || !alt) {
    return null
  }

  return {
    src,
    alt,
    mimeType: inferMosaicVideoMimeType(tile.objectKey),
  }
}
