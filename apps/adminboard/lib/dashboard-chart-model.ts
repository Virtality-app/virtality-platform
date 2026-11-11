import { formatBucketLabel } from './dashboard-format'
import {
  SESSION_TYPES,
  mapSessionTypes,
  type ClinicianActivity,
  type DashboardGranularity,
  type SessionActivityTrendPoint,
  type SessionType,
  type SessionTypeCounts,
} from './dashboard-types'

export type TypeTrendRow = { label: string } & SessionTypeCounts

export type ClinicianSeries = { key: string; label: string }

export type ClinicianTrendModel = {
  rows: Array<Record<string, string | number>>
  series: ClinicianSeries[]
}

export type AverageLengthRow = { label: string } & Record<
  SessionType,
  number | null
>

export const sumTypeCounts = (counts: SessionTypeCounts): number =>
  SESSION_TYPES.reduce((sum, type) => sum + counts[type], 0)

export function buildTypeTrendRows(
  trend: SessionActivityTrendPoint[],
  granularity: DashboardGranularity,
  measure: 'sessions' | 'minutes',
): TypeTrendRow[] {
  return trend.map((point) => {
    const counts =
      measure === 'sessions' ? point.sessionsByType : point.minutesByType
    return {
      label: formatBucketLabel(point.bucketStart, granularity),
      ...mapSessionTypes((type) => Math.round(counts[type])),
    }
  })
}

/** One series per clinician with at least one session. */
export function buildClinicianTrendModel(
  trend: SessionActivityTrendPoint[],
  clinicians: ClinicianActivity[],
  granularity: DashboardGranularity,
): ClinicianTrendModel {
  const series = clinicians
    .filter((clinician) => clinician.sessionCount > 0)
    .map((clinician) => ({
      key: clinician.userId,
      label: clinician.userLabel,
    }))

  const rows = trend.map((point) => {
    const row: Record<string, string | number> = {
      label: formatBucketLabel(point.bucketStart, granularity),
    }
    // Leave a clinician out of a bar they had no sessions in, so the
    // tooltip lists only clinicians who did sessions then.
    for (const { key } of series) {
      const count = point.sessionsByUser[key]
      if (count) row[key] = count
    }
    return row
  })

  return { rows, series }
}

export function buildAverageLengthRows(
  trend: SessionActivityTrendPoint[],
  granularity: DashboardGranularity,
): AverageLengthRow[] {
  return trend.map((point) => ({
    label: formatBucketLabel(point.bucketStart, granularity),
    ...point.averageMinutesByType,
  }))
}

/** Percent widths of each type against `scaleMax` (defaults to the row total). */
export function typeSegmentWidths(
  counts: SessionTypeCounts,
  scaleMax?: number,
): SessionTypeCounts {
  const max = scaleMax ?? sumTypeCounts(counts)
  if (max <= 0) return mapSessionTypes(() => 0)
  return mapSessionTypes((type) => (counts[type] / max) * 100)
}
