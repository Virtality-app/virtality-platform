export const IMMERSIVE_VIDEO_PART_SIZE_BYTES = 67_108_864

export const IMMERSIVE_VIDEO_ALLOWED_EXTENSIONS = [
  'mp4',
  'm4v',
  'mov',
  'webm',
  'mkv',
] as const

export type ImmersiveVideoActivity = 'CYCLING' | 'WALKING'

export type ImmersiveVideoCatalogState =
  | 'Draft'
  | 'Uploading'
  | 'Verifying'
  | 'Published'
  | 'Republishing'
  | 'Unpublished'

export type ImmersiveVideoRecord = {
  id: string
  title: string
  activity: ImmersiveVideoActivity
  description: string | null
  state: ImmersiveVideoCatalogState
  priorState: ImmersiveVideoCatalogState | null
  version: number
  objectKey: string | null
  sizeBytes: bigint | number | null
  checksum: string | null
  durationSec: number | null
  filename: string | null
  thumbnailKey: string | null
  uploadId: string | null
  uploadObjectKey: string | null
  uploadFilename: string | null
  uploadSizeBytes: bigint | number | null
  uploadDurationSec: number | null
  verifyFailedAt: Date | null
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type ImmersiveVideoAdminRow = {
  id: string
  title: string
  activity: ImmersiveVideoActivity
  description: string | null
  state: ImmersiveVideoCatalogState
  version: number
  sizeBytes: number | null
  durationSec: number | null
  thumbnailUrl: string | null
  filename: string | null
  uploadProgress?: { uploadedParts: number; partCount: number }
  verifyFailedAt: Date | null
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export function immersiveVideoPartCount(sizeBytes: number): number {
  if (sizeBytes <= 0) {
    return 0
  }
  return Math.ceil(sizeBytes / IMMERSIVE_VIDEO_PART_SIZE_BYTES)
}

export function expectedImmersiveVideoPartSize(
  sizeBytes: number,
  partNumber: number,
): number {
  const partCount = immersiveVideoPartCount(sizeBytes)
  if (partNumber < 1 || partNumber > partCount) {
    return 0
  }
  const start = (partNumber - 1) * IMMERSIVE_VIDEO_PART_SIZE_BYTES
  return Math.min(IMMERSIVE_VIDEO_PART_SIZE_BYTES, sizeBytes - start)
}

export function immersiveVideoFileExtension(filename: string): string | null {
  const trimmed = filename.trim()
  const dot = trimmed.lastIndexOf('.')
  if (dot <= 0 || dot === trimmed.length - 1) {
    return null
  }
  return trimmed.slice(dot + 1).toLowerCase()
}

export function isAllowedImmersiveVideoExtension(
  extension: string | null,
): boolean {
  if (!extension) {
    return false
  }
  return (IMMERSIVE_VIDEO_ALLOWED_EXTENSIONS as readonly string[]).includes(
    extension,
  )
}

export function toSizeBytesNumber(
  value: bigint | number | null | undefined,
): number | null {
  if (value == null) {
    return null
  }
  return typeof value === 'bigint' ? Number(value) : value
}

export function isImmersiveVideoDiscardEmpty(row: {
  title: string
  description: string | null | undefined
  thumbnailKey: string | null | undefined
  uploadId: string | null | undefined
  objectKey: string | null | undefined
}): boolean {
  return (
    row.title === '' &&
    (row.description == null || row.description === '') &&
    row.thumbnailKey == null &&
    row.uploadId == null &&
    row.objectKey == null
  )
}

export class ImmersiveVideoError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ImmersiveVideoError'
  }
}

export class ImmersiveVideoNotFoundError extends ImmersiveVideoError {
  constructor(id: string) {
    super(`Immersive video ${id} was not found.`)
    this.name = 'ImmersiveVideoNotFoundError'
  }
}
