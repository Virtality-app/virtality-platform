import { addDays, differenceInCalendarDays, format, subMonths } from 'date-fns'
import type { DashboardGranularity } from './dashboard-types'

export type DashboardPreset = '7d' | '4w' | '8w' | '6m' | 'all' | 'custom'

/** Inclusive calendar dates, `YYYY-MM-DD`. */
export type DashboardRange = { from: string; to: string }

export const MIN_WINDOW_DAYS = 3

export const DASHBOARD_PRESETS: { value: DashboardPreset; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '4w', label: '4 weeks' },
  { value: '8w', label: '8 weeks' },
  { value: '6m', label: '6 months' },
  { value: 'all', label: 'All time' },
]

export const toISODate = (date: Date): string => format(date, 'yyyy-MM-dd')

export const parseISODate = (value: string): Date =>
  new Date(`${value}T00:00:00`)

export function rangeForPreset(
  preset: Exclude<DashboardPreset, 'custom'>,
  today: Date,
): DashboardRange {
  const to = toISODate(today)
  switch (preset) {
    case '7d':
      return { from: toISODate(addDays(today, -6)), to }
    case '4w':
      return { from: toISODate(addDays(today, -27)), to }
    case '8w':
      return { from: toISODate(addDays(today, -55)), to }
    case '6m':
      return { from: toISODate(addDays(subMonths(today, 6), 1)), to }
    // The server starts All Time at the first session on record.
    case 'all':
      return { from: to, to }
  }
}

export const defaultGranularityFor = (
  range: DashboardRange,
): DashboardGranularity =>
  differenceInCalendarDays(parseISODate(range.to), parseISODate(range.from)) <
  21
    ? 'day'
    : 'week'

export const isRangeLongEnough = (from: Date, to: Date): boolean =>
  differenceInCalendarDays(to, from) + 1 >= MIN_WINDOW_DAYS

export const formatRangeLabel = (range: DashboardRange): string => {
  const from = parseISODate(range.from)
  const to = parseISODate(range.to)
  const sameYear = from.getFullYear() === to.getFullYear()
  return `${format(from, sameYear ? 'd MMM' : 'd MMM yyyy')} – ${format(to, 'd MMM yyyy')}`
}
