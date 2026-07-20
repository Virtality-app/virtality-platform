import type { BucketObjectRow } from '@virtality/shared/utils'

export const PROMO_VIDEO_UPLOAD_PREFIX = 'marketing/videos'

function normalizeBucketPickerQuery(query: string): string {
  return query.trim().toLowerCase()
}

function matchesBucketPickerQuery(
  values: string[],
  normalizedQuery: string,
): boolean {
  return values.some((value) => value.toLowerCase().includes(normalizedQuery))
}

export function filterBucketMp4PickerObjects(
  objects: BucketObjectRow[],
  query: string,
): BucketObjectRow[] {
  const normalizedQuery = normalizeBucketPickerQuery(query)
  const mp4Objects = objects.filter(
    (object) =>
      object.contentType === 'video/mp4' ||
      object.objectKey.toLowerCase().endsWith('.mp4'),
  )

  if (!normalizedQuery) {
    return mp4Objects
  }

  return mp4Objects.filter((object) =>
    matchesBucketPickerQuery([object.name, object.objectKey], normalizedQuery),
  )
}
