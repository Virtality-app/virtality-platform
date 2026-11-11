import { describe, expect, it } from 'vitest'
import { UNKNOWN_OWNER_ID, UNKNOWN_OWNER_LABEL } from './analytics-filters.ts'
import {
  buildBucketKeys,
  buildSessionActivityReport,
  type ActivitySessionRow,
} from './session-activity-report.ts'

const session = (
  patientId: string,
  completedAt: string,
  minutes: number,
  videoMinutes: number | null = null,
): ActivitySessionRow => ({
  patientId,
  completedAt,
  createdAt: new Date(
    new Date(completedAt).getTime() - minutes * 60_000,
  ).toISOString(),
  deletedAt: null,
  videoMinutes,
})

/** A session with no recorded end still counts; it just has no duration. */
const withoutEnd = (
  patientId: string,
  createdAt: string,
): ActivitySessionRow => ({
  patientId,
  createdAt,
  completedAt: null,
  deletedAt: null,
  videoMinutes: null,
})

const baseInput = {
  from: '2026-11-02',
  to: '2026-11-15',
  granularity: 'week' as const,
  userNamesById: { 'user-a': 'Alex', 'user-b': 'Bea' },
  patients: [
    { id: 'p1', name: 'Patient One', userId: 'user-a' },
    { id: 'p2', name: 'Patient Two', userId: 'user-a' },
    { id: 'p3', name: 'Patient Three', userId: 'user-b' },
    { id: 'p4', name: 'Patient Four', userId: null },
  ],
}

describe('buildBucketKeys', () => {
  it('lists every day in the window', () => {
    expect(buildBucketKeys('2026-11-02', '2026-11-04', 'day')).toEqual([
      '2026-11-02',
      '2026-11-03',
      '2026-11-04',
    ])
  })

  it('lists ISO week starts covering the window', () => {
    expect(buildBucketKeys('2026-11-04', '2026-11-16', 'week')).toEqual([
      '2026-11-02',
      '2026-11-09',
      '2026-11-16',
    ])
  })
})

describe('buildSessionActivityReport', () => {
  const report = buildSessionActivityReport({
    ...baseInput,
    sessions: [
      session('p1', '2026-11-03T10:30:00.000Z', 30),
      session('p1', '2026-11-10T10:20:00.000Z', 20, 12),
      session('p2', '2026-11-11T11:00:00.000Z', 50, 15),
      session('p3', '2026-11-12T09:05:00.000Z', 5),
      session('unknown-patient', '2026-11-12T09:05:00.000Z', 5),
      withoutEnd('p4', '2026-11-13T08:00:00.000Z'),
    ],
  })

  it('counts and times sessions by type', () => {
    expect(report.summary).toMatchObject({
      sessionCount: 5,
      shortSessionCount: 0,
      sessionsByType: { exercise: 3, vr: 2 },
      totalMinutes: 105,
      minutesByType: { exercise: 35, vr: 70 },
      averageMinutes: 26.3,
      averageMinutesByType: { exercise: 17.5, vr: 35 },
      sessionsWithDuration: 4,
      totalPatients: 4,
      activePatients: 4,
      averageSessionsPerActivePatient: 1.3,
    })
  })

  it('buckets sessions per week with an owner breakdown', () => {
    expect(report.trend.map((point) => point.bucketStart)).toEqual([
      '2026-11-02',
      '2026-11-09',
    ])
    expect(report.trend[1]).toMatchObject({
      sessionsByType: { exercise: 2, vr: 2 },
      sessionsByUser: {
        'user-a': 2,
        'user-b': 1,
        [UNKNOWN_OWNER_ID]: 1,
      },
    })
  })

  it('sorts sessions into length buckets', () => {
    const counts = Object.fromEntries(
      report.lengthBuckets.map((bucket) => [bucket.key, bucket.sessionsByType]),
    )
    expect(counts['lt10']).toEqual({ exercise: 1, vr: 0 })
    expect(counts['20-30']).toEqual({ exercise: 0, vr: 1 })
    expect(counts['30-45']).toEqual({ exercise: 1, vr: 0 })
    expect(counts['45-60']).toEqual({ exercise: 0, vr: 1 })
  })

  it('lists every clinician with all and active patients', () => {
    expect(
      report.clinicians.map((c) => [
        c.userLabel,
        c.totalPatients,
        c.activePatients,
        c.vrPatients,
        c.sessionCount,
      ]),
    ).toEqual([
      ['Alex', 2, 2, 2, 3],
      ['Bea', 1, 1, 0, 1],
      [UNKNOWN_OWNER_LABEL, 1, 1, 0, 1],
    ])
    expect(report.clinicians[2]!.userId).toBe(UNKNOWN_OWNER_ID)
    // Last session is when it started, since many sessions never get an end time.
    expect(report.clinicians[0]!.lastSessionAt).toBe('2026-11-11T10:10:00.000Z')
  })

  it('ranks active patients and groups them by what they did', () => {
    expect(report.patients.map((p) => [p.patientName, p.sessionCount])).toEqual(
      [
        ['Patient One', 2],
        ['Patient Four', 1],
        ['Patient Three', 1],
        ['Patient Two', 1],
      ],
    )
    expect(report.patientMix).toEqual({
      exerciseOnly: 2,
      vrOnly: 1,
      exerciseAndVr: 1,
    })
  })

  it('counts Don’t Save sessions and times them until they were deleted', () => {
    const withNotSaved = buildSessionActivityReport({
      ...baseInput,
      sessions: [
        session('p1', '2026-11-03T10:30:00.000Z', 30),
        {
          patientId: 'p2',
          createdAt: '2026-11-04T10:00:00.000Z',
          completedAt: null,
          deletedAt: '2026-11-04T10:03:00.000Z',
          videoMinutes: null,
        },
      ],
    })
    expect(withNotSaved.summary).toMatchObject({
      sessionCount: 2,
      shortSessionCount: 1,
      sessionsWithDuration: 2,
      totalMinutes: 33,
      activePatients: 2,
    })
  })

  it('returns empty buckets when nothing happened', () => {
    const empty = buildSessionActivityReport({ ...baseInput, sessions: [] })
    expect(empty.summary.averageMinutes).toBeNull()
    expect(empty.trend).toHaveLength(2)
    expect(empty.patients).toEqual([])
  })
})
