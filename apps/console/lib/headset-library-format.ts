import { formatDistanceToNow } from 'date-fns'
import { el } from 'date-fns/locale'
import type { Translate } from '@/i18n/translate'

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

export function formatVideoMetaLine(
  input: {
    activity: 'CYCLING' | 'WALKING' | null
    durationSec: number | null
    sizeBytes: number
  },
  t: Translate,
): string {
  return [
    input.activity ? t(`activity.${input.activity}`, { ns: 'vr-video' }) : null,
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

export function stalledSuffix(stalled: boolean, t: Translate): string {
  return stalled ? ` · ${t('cell.stalled', { ns: 'vr-video' })}` : ''
}

export function pausedProgressLabel(
  bytesDownloaded: number,
  sizeBytes: number,
  t: Translate,
): string {
  return t('cell.paused', {
    ns: 'vr-video',
    downloaded: formatByteSize(bytesDownloaded),
    size: formatByteSize(sizeBytes),
  })
}

export function formatReportedAgo(
  reportedAt?: string | null,
  language?: string,
): string | null {
  if (!reportedAt) return null
  return formatDistanceToNow(new Date(reportedAt), {
    addSuffix: true,
    locale: language === 'el' ? el : undefined,
  })
}

/** What follows "Online" / "Offline" in a headset's status line. */
export function headsetStorageSubtitle(
  input: {
    online: boolean
    freeBytes: number | null
    reportedAt: string | null
  },
  t: Translate,
  language?: string,
): string {
  if (input.online && input.freeBytes != null) {
    return t('status.free', {
      ns: 'vr-video',
      size: formatByteSize(input.freeBytes),
    })
  }
  const reportedAgo = formatReportedAgo(input.reportedAt, language)
  if (!input.online && reportedAgo) {
    return t('status.lastSeen', { ns: 'vr-video', ago: reportedAgo })
  }
  if (!input.online) return t('status.neverConnected', { ns: 'vr-video' })
  return t('status.connecting', { ns: 'vr-video' })
}
