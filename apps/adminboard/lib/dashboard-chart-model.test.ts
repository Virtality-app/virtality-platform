import { describe, expect, it } from 'vitest'
import {
  buildAverageLengthRows,
  buildClinicianTrendModel,
  buildTypeTrendRows,
  typeSegmentWidths,
} from './dashboard-chart-model'
import type {
  ClinicianActivity,
  SessionActivityTrendPoint,
} from './dashboard-types'

const point = (
  bucketStart: string,
  sessionsByUser: Record<string, number>,
): SessionActivityTrendPoint => ({
  bucketStart,
  sessionsByType: { exercise: 3, vr: 1 },
  minutesByType: { exercise: 90.4, vr: 15 },
  averageMinutesByType: { exercise: 30.1, vr: 15 },
  sessionsByUser,
})

const clinician = (
  userId: string,
  userLabel: string,
  sessionCount: number,
): ClinicianActivity => ({
  userId,
  userLabel,
  sessionCount,
  totalPatients: 1,
  activePatients: 1,
  vrPatients: 0,
  sessionsByType: { exercise: sessionCount, vr: 0 },
  totalMinutes: 0,
  minutesByType: { exercise: 0, vr: 0 },
  averageMinutes: null,
  lastSessionAt: null,
})

const trend = [
  point('2026-11-02', { a: 2, b: 2 }),
  point('2026-11-09', { a: 4 }),
]

describe('buildTypeTrendRows', () => {
  it('maps sessions or minutes per type', () => {
    expect(buildTypeTrendRows(trend, 'week', 'sessions')[0]).toEqual({
      label: 'w/c 2 Nov',
      exercise: 3,
      vr: 1,
    })
    expect(buildTypeTrendRows(trend, 'week', 'minutes')[0]!.exercise).toBe(90)
  })
})

describe('buildClinicianTrendModel', () => {
  it('has one series per clinician with sessions and leaves out empty ones per bar', () => {
    const model = buildClinicianTrendModel(
      trend,
      [
        clinician('a', 'Alex', 6),
        clinician('b', 'Bea', 2),
        clinician('c', 'Cy', 0),
      ],
      'week',
    )
    expect(model.series).toEqual([
      { key: 'a', label: 'Alex' },
      { key: 'b', label: 'Bea' },
    ])
    expect(model.rows[1]).toEqual({ label: 'w/c 9 Nov', a: 4 })
  })
})

describe('buildAverageLengthRows', () => {
  it('keeps missing averages as null so lines break', () => {
    expect(buildAverageLengthRows(trend, 'day')[0]).toEqual({
      label: 'Mon 2 Nov',
      exercise: 30.1,
      vr: 15,
    })
  })
})

describe('typeSegmentWidths', () => {
  it('splits a row by its own total or a shared scale', () => {
    expect(typeSegmentWidths({ exercise: 3, vr: 1 })).toEqual({
      exercise: 75,
      vr: 25,
    })
    expect(typeSegmentWidths({ exercise: 1, vr: 1 }, 4)).toEqual({
      exercise: 25,
      vr: 25,
    })
    expect(typeSegmentWidths({ exercise: 0, vr: 0 })).toEqual({
      exercise: 0,
      vr: 0,
    })
  })
})
