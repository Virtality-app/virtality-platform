export type ImmersiveVideoActivity = 'CYCLING' | 'WALKING'

export type ImmersiveVideoCatalogState =
  | 'Draft'
  | 'Uploading'
  | 'Verifying'
  | 'Published'
  | 'Republishing'
  | 'Unpublished'

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
  verifyFailedAt: Date | string | null
  publishedAt: Date | string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export function immersiveVideoHasFile(row: ImmersiveVideoAdminRow): boolean {
  return Boolean(row.filename) || (row.sizeBytes != null && row.sizeBytes > 0)
}

export function immersiveVideoUploadPercent(
  row: ImmersiveVideoAdminRow,
): number | null {
  const progress = row.uploadProgress
  if (!progress || progress.partCount === 0) {
    return null
  }
  return Math.round((progress.uploadedParts / progress.partCount) * 100)
}

export type ImmersiveVideoRowAction =
  | 'Edit'
  | 'Upload file'
  | 'Delete'
  | 'Resume upload'
  | 'Cancel upload'
  | 'Publish'
  | 'Replace file'
  | 'Unpublish'
  | 'Cancel replace'

export function immersiveVideoRowActions(
  row: ImmersiveVideoAdminRow,
): ImmersiveVideoRowAction[] {
  if (row.state === 'Uploading') {
    return ['Resume upload', 'Cancel upload', 'Edit', 'Delete']
  }
  if (row.state === 'Verifying') {
    return ['Edit']
  }
  if (row.state === 'Republishing') {
    return ['Edit', 'Cancel replace']
  }
  if (row.state === 'Published') {
    return ['Edit', 'Unpublish', 'Replace file', 'Delete']
  }
  if (row.state === 'Unpublished') {
    return ['Edit', 'Publish', 'Replace file', 'Delete']
  }
  if (immersiveVideoHasFile(row)) {
    return ['Edit', 'Publish', 'Replace file', 'Delete']
  }
  return ['Edit', 'Upload file', 'Delete']
}

export function immersiveVideoStateBadgeLabel(
  row: ImmersiveVideoAdminRow,
): string {
  if (row.state === 'Uploading') {
    const percent = immersiveVideoUploadPercent(row)
    return percent == null ? 'Uploading' : `Uploading ${percent} %`
  }
  if (row.state === 'Draft' && !immersiveVideoHasFile(row)) {
    return 'Draft · no file'
  }
  return row.state
}

export function formatImmersiveVideoSize(sizeBytes: number | null): string {
  if (sizeBytes == null) {
    return '–'
  }
  if (sizeBytes >= 1_000_000_000) {
    return `${(sizeBytes / 1_000_000_000).toFixed(1)} GB`
  }
  if (sizeBytes >= 1_000_000) {
    return `${(sizeBytes / 1_000_000).toFixed(1)} MB`
  }
  if (sizeBytes >= 1000) {
    return `${(sizeBytes / 1000).toFixed(1)} KB`
  }
  return `${sizeBytes} B`
}

export function formatImmersiveVideoDuration(
  durationSec: number | null,
): string {
  if (durationSec == null) {
    return '–'
  }
  const hours = Math.floor(durationSec / 3600)
  const minutes = Math.floor((durationSec % 3600) / 60)
  const seconds = durationSec % 60
  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  if (hours > 0) {
    return `${hours}:${mm}:${ss}`
  }
  return `${mm}:${ss}`
}

export function formatImmersiveVideoUploadProgress(
  uploadedBytes: number,
  totalBytes: number,
): string {
  const percent =
    totalBytes === 0 ? 0 : Math.round((uploadedBytes / totalBytes) * 100)
  return `${formatImmersiveVideoSize(uploadedBytes)} of ${formatImmersiveVideoSize(totalBytes)} · ${percent} %`
}

export const IMMERSIVE_VIDEO_UNSUPPORTED_FILE =
  "This file type isn't supported. Use MP4, M4V, MOV, WEBM or MKV."

export const IMMERSIVE_VIDEO_FILE_HINT =
  'MP4 (H.264/H.265) is the format the headset is tested with.'

export const IMMERSIVE_VIDEO_ALLOWED_EXTENSIONS = [
  'mp4',
  'm4v',
  'mov',
  'webm',
  'mkv',
] as const

export function isAllowedImmersiveVideoFilename(filename: string): boolean {
  const extension = filename.split('.').pop()?.toLowerCase()
  if (!extension || extension === filename.toLowerCase()) {
    return false
  }
  return (IMMERSIVE_VIDEO_ALLOWED_EXTENSIONS as readonly string[]).includes(
    extension,
  )
}

export function publishPreconditionLabel(
  row: ImmersiveVideoAdminRow,
): string | null {
  if (!row.thumbnailUrl) {
    return 'Add a thumbnail to publish'
  }
  if (!immersiveVideoHasFile(row)) {
    return 'Upload a file to publish'
  }
  if (!row.title.trim()) {
    return 'Add a title to publish'
  }
  return null
}
