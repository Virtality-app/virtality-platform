import { describe, expect, it } from 'vitest'
import { UNKNOWN_OWNER_ID } from './analytics-filters.ts'
import { buildSessionLog, type SessionLogSourceRow } from './session-log.ts'

const row = (
  id: string,
  createdAt: string,
  overrides: Partial<SessionLogSourceRow> = {},
): SessionLogSourceRow => ({
  id,
  createdAt,
  completedAt: new Date(
    new Date(createdAt).getTime() + 30 * 60_000,
  ).toISOString(),
  patientId: `patient-${id}`,
  patientName: `Patient ${id}`,
  userId: 'user-a',
  programName: 'Knee rehab',
  exerciseCount: 5,
  nprs: null,
  deletedAt: null,
  videoMinutes: null,
  ...overrides,
})

const source = [
  row('1', '2026-11-03T10:00:00.000Z'),
  row('2', '2026-11-05T10:00:00.000Z', {
    exerciseCount: 0,
    videoMinutes: 30,
  }),
  row('3', '2026-11-04T10:00:00.000Z', {
    exerciseCount: 0,
    videoMinutes: 20,
    userId: 'user-b',
    programName: null,
  }),
  row('4', '2026-11-06T10:00:00.000Z', {
    completedAt: null,
    userId: null,
    programName: 'Shoulder mobility',
  }),
]

const names = { 'user-a': 'Alex', 'user-b': 'Bea' }
const all = {
  type: 'all' as const,
  ownerUserId: 'all',
  saved: 'all' as const,
  search: '',
  page: 1,
  pageSize: 25,
}

describe('buildSessionLog', () => {
  it('lists sessions newest first with type and minutes', () => {
    const log = buildSessionLog(source, names, all)
    expect(log.rows.map((r) => [r.id, r.type, r.totalMinutes])).toEqual([
      ['4', 'exercise', null],
      ['2', 'vr', 30],
      ['3', 'vr', 30],
      ['1', 'exercise', 30],
    ])
    expect(log.rows[0]!.userId).toBe(UNKNOWN_OWNER_ID)
    expect(log.countsByType).toEqual({ exercise: 2, vr: 2 })
  })

  it('filters by type but keeps counts for every type', () => {
    const log = buildSessionLog(source, names, { ...all, type: 'vr' })
    expect(log.rows.map((r) => r.id)).toEqual(['2', '3'])
    expect(log.total).toBe(2)
    expect(log.countsByType).toEqual({ exercise: 2, vr: 2 })
  })

  it('filters by owner and searches patient, clinician and program', () => {
    expect(
      buildSessionLog(source, names, { ...all, ownerUserId: 'user-b' }).rows,
    ).toHaveLength(1)
    expect(
      buildSessionLog(source, names, { ...all, search: 'bea' }).rows[0]!.id,
    ).toBe('3')
    expect(
      buildSessionLog(source, names, { ...all, search: 'SHOULDER' }).rows[0]!
        .id,
    ).toBe('4')
  })

  it('paginates and clamps the page', () => {
    const log = buildSessionLog(source, names, {
      ...all,
      page: 9,
      pageSize: 3,
    })
    expect(log.page).toBe(2)
    expect(log.rows.map((r) => r.id)).toEqual(['1'])
    expect(log.total).toBe(4)
  })

  it('marks and filters Don’t Save sessions', () => {
    const withNotSaved = [
      ...source,
      row('5', '2026-11-07T10:00:00.000Z', {
        completedAt: null,
        deletedAt: '2026-11-07T10:07:00.000Z',
      }),
    ]
    const log = buildSessionLog(withNotSaved, names, all)
    expect(log.savedCounts).toEqual({ saved: 4, notSaved: 1 })
    expect(log.rows[0]).toMatchObject({
      id: '5',
      notSaved: true,
      endedAt: '2026-11-07T10:07:00.000Z',
      totalMinutes: 7,
    })

    const notSaved = buildSessionLog(withNotSaved, names, {
      ...all,
      saved: 'notSaved',
    })
    expect(notSaved.rows.map((r) => r.id)).toEqual(['5'])
    expect(notSaved.countsByType).toEqual({ exercise: 1, vr: 0 })
    expect(
      buildSessionLog(withNotSaved, names, { ...all, saved: 'saved' }).total,
    ).toBe(4)
  })
})
