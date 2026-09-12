import { formatDistanceToNow } from 'date-fns'

export function formatByteSize(bytes: number): string {
  if (bytes >= 1_000_000_000) {
    return `${(bytes / 1_000_000_000).toFixed(1)} GB`
  }
  if (bytes >= 1_000_000) {
    return `${(bytes / 1_000_000).toFixed(1)} MB`
  }
  if (bytes >= 1_000) {
    return `${(bytes / 1_000).toFixed(1)} KB`
  }
  return `${Math.max(0, Math.round(bytes))} B`
}

export function formatActivityLabel(
  activity: 'CYCLING' | 'WALKING' | null,
): string | null {
  if (activity === 'CYCLING') return 'Cycling'
  if (activity === 'WALKING') return 'Walking'
  return null
}

export function formatDurationLabel(durationSec: number | null): string | null {
  if (durationSec == null || durationSec < 0) return null
  const minutes = Math.floor(durationSec / 60)
  const seconds = durationSec % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function formatVideoMetaLine(input: {
  activity: 'CYCLING' | 'WALKING' | null
  durationSec: number | null
  sizeBytes: number
}): string {
  return [
    formatActivityLabel(input.activity),
    formatDurationLabel(input.durationSec),
    formatByteSize(input.sizeBytes),
  ]
    .filter((part): part is string => part != null && part.length > 0)
    .join(' · ')
}

export function downloadPercent(
  bytesDownloaded: number,
  sizeBytes: number,
): number {
  if (sizeBytes <= 0) return 0
  return Math.min(
    100,
    Math.max(0, Math.round((bytesDownloaded / sizeBytes) * 100)),
  )
}

export function storageUsedRatio(usedBytes: number, freeBytes: number): number {
  const total = usedBytes + Math.max(0, freeBytes)
  if (total <= 0) return 0
  return Math.min(1, Math.max(0, usedBytes / total))
}

export function headsetStorageSubtitle(input: {
  online: boolean
  freeBytes: number | null
  reportedAt: string | null
}): string {
  if (input.online && input.freeBytes != null) {
    return `${formatByteSize(input.freeBytes)} free`
  }
  if (!input.online && input.reportedAt) {
    return `Offline · last seen ${formatDistanceToNow(new Date(input.reportedAt), { addSuffix: true })}`
  }
  if (!input.online) {
    return 'Offline · never connected'
  }
  return 'Connecting…'
}
