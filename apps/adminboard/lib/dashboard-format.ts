import { differenceInCalendarDays, format } from 'date-fns'
import { parseISODate } from './dashboard-range'
import type { DashboardGranularity } from './dashboard-types'

/** `29 min`, `2 h 5 min`, or `198 h` once it passes ten hours. */
export function formatMinutes(minutes: number | null): string {
  if (minutes === null) return '—'
  const rounded = Math.round(minutes)
  if (rounded < 60) return `${rounded} min`
  const hours = Math.floor(rounded / 60)
  const rest = rounded % 60
  if (hours >= 10 || rest === 0) return `${Math.round(rounded / 60)} h`
  return `${hours} h ${rest} min`
}

export function formatShare(part: number, total: number): string {
  if (total === 0) return '—'
  return `${Math.round((part / total) * 100)}%`
}

export function formatBucketLabel(
  bucketStart: string,
  granularity: DashboardGranularity,
): string {
  const date = parseISODate(bucketStart)
  return granularity === 'day'
    ? format(date, 'EEE d MMM')
    : `w/c ${format(date, 'd MMM')}`
}

export const formatSessionDate = (iso: string): string =>
  format(new Date(iso), 'd MMM yyyy')

export const formatSessionTime = (iso: string): string =>
  format(new Date(iso), 'HH:mm')

export function formatLastActive(iso: string | null, now: Date): string {
  if (!iso) return '—'
  const days = differenceInCalendarDays(now, new Date(iso))
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return format(new Date(iso), 'd MMM')
}
