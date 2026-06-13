import { describe, expect, it } from 'vitest'
import { UNKNOWN_OWNER_ID, UNKNOWN_OWNER_LABEL } from './analytics-filters.ts'
import { buildEffectivenessReport } from './effectiveness-report-aggregation.ts'

describe('buildEffectivenessReport', () => {
  it('groups patients and completed sessions by owner', () => {
    const report = buildEffectivenessReport({
      patients: [
        { id: 'patient-1', userId: 'user-a' },
        { id: 'patient-2', userId: 'user-a' },
        { id: 'patient-3', userId: 'user-b' },
      ],
      sessions: [
        { patientId: 'patient-1' },
        { patientId: 'patient-1' },
        { patientId: 'patient-3' },
      ],
      userNamesById: {
        'user-a': 'Alice',
        'user-b': 'Bob',
      },
    })

    expect(report.summary).toEqual({
      totalPatients: 3,
      activePatients: 2,
      patientActivationRatePercent: 66.7,
      completedSessions: 3,
      averageSessionsPerActivePatient: 1.5,
    })

    expect(report.byUser).toEqual([
      {
        userId: 'user-a',
        userLabel: 'Alice',
        totalPatients: 2,
        activePatients: 1,
        patientActivationRatePercent: 50,
        completedSessions: 2,
        averageSessionsPerActivePatient: 2,
      },
      {
        userId: 'user-b',
        userLabel: 'Bob',
        totalPatients: 1,
        activePatients: 1,
        patientActivationRatePercent: 100,
        completedSessions: 1,
        averageSessionsPerActivePatient: 1,
      },
    ])
    expect(report.hasSessionActivity).toBe(true)
  })

  it('uses stable labels for unknown or missing owner names', () => {
    const report = buildEffectivenessReport({
      patients: [
        { id: 'patient-1', userId: null },
        { id: 'patient-2', userId: 'user-missing-name' },
      ],
      sessions: [{ patientId: 'patient-1' }],
      userNamesById: {},
    })

    expect(report.byUser).toEqual([
      {
        userId: UNKNOWN_OWNER_ID,
        userLabel: UNKNOWN_OWNER_LABEL,
        totalPatients: 1,
        activePatients: 1,
        patientActivationRatePercent: 100,
        completedSessions: 1,
        averageSessionsPerActivePatient: 1,
      },
      {
        userId: 'user-missing-name',
        userLabel: 'Unnamed owner',
        totalPatients: 1,
        activePatients: 0,
        patientActivationRatePercent: 0,
        completedSessions: 0,
        averageSessionsPerActivePatient: null,
      },
    ])
  })

  it('returns null rates and averages when denominators are zero', () => {
    const report = buildEffectivenessReport({
      patients: [],
      sessions: [],
      userNamesById: {},
    })

    expect(report.summary).toEqual({
      totalPatients: 0,
      activePatients: 0,
      patientActivationRatePercent: null,
      completedSessions: 0,
      averageSessionsPerActivePatient: null,
    })
    expect(report.byUser).toEqual([])
    expect(report.hasSessionActivity).toBe(false)
  })

  it('ignores sessions for patients outside the scoped patient list', () => {
    const report = buildEffectivenessReport({
      patients: [{ id: 'patient-1', userId: 'user-a' }],
      sessions: [{ patientId: 'patient-orphan' }],
      userNamesById: { 'user-a': 'Alice' },
    })

    expect(report.summary.completedSessions).toBe(0)
    expect(report.summary.activePatients).toBe(0)
    expect(report.byUser[0]).toMatchObject({
      userId: 'user-a',
      completedSessions: 0,
      activePatients: 0,
    })
  })
})
