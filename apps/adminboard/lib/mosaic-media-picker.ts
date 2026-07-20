import type { MosaicMediaKind } from '@virtality/shared/types'
import type { BucketObjectRow } from '@virtality/shared/utils'
import { filterBucketImagePickerFolders } from './bucket-image-picker'

const MOSAIC_IMAGE_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

const MOSAIC_VIDEO_CONTENT_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
])

function normalizeMosaicMediaPickerQuery(query: string): string {
  return query.trim().toLowerCase()
}

function matchesMosaicMediaPickerQuery(
  values: string[],
  normalizedQuery: string,
): boolean {
  return values.some((value) => value.toLowerCase().includes(normalizedQuery))
}

export function isMosaicMediaContentType(contentType: string): boolean {
  return (
    MOSAIC_IMAGE_CONTENT_TYPES.has(contentType) ||
    MOSAIC_VIDEO_CONTENT_TYPES.has(contentType)
  )
}

export function inferMosaicMediaKindFromContentType(
  contentType: string,
): MosaicMediaKind | null {
  if (MOSAIC_IMAGE_CONTENT_TYPES.has(contentType)) {
    return 'image'
  }

  if (MOSAIC_VIDEO_CONTENT_TYPES.has(contentType)) {
    return 'video'
  }

  return null
}

export function filterMosaicMediaPickerObjects(
  objects: BucketObjectRow[],
  query: string,
): BucketObjectRow[] {
  const mosaicObjects = objects.filter((object) =>
    isMosaicMediaContentType(object.contentType),
  )

  const normalizedQuery = normalizeMosaicMediaPickerQuery(query)
  if (!normalizedQuery) {
    return mosaicObjects
  }

  return mosaicObjects.filter((object) =>
    matchesMosaicMediaPickerQuery(
      [object.name, object.objectKey],
      normalizedQuery,
    ),
  )
}

export { filterBucketImagePickerFolders as filterMosaicMediaPickerFolders }
