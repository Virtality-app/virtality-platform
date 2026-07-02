import { describe, expect, it } from 'vitest'
import { buildSessionExerciseRowsFromWorkingCopy } from './patient-dashboard-session-launch.js'
import {
  buildCurrentExerciseProgressUpsert,
  buildSessionProgressUpserts,
  resolveExerciseProgressForPersistence,
  serializeSessionProgressValue,
} from './session-progress-persistence.js'
import type { CompleteExercise } from '@/types/models'

const sampleExercises: CompleteExercise[] = [
  {
    id: 'row-1',
    exerciseId: 'ex-1',
    sets: 3,
    reps: 10,
    restTime: 5,
    holdTime: 1,
    speed: 1,
    romMode: 0,
  },
  {
    id: 'row-2',
    exerciseId: 'ex-2',
    sets: 2,
    reps: 8,
    restTime: 4,
    holdTime: 2,
    speed: 1.5,
    romMode: 0,
  },
]

describe('serializeSessionProgressValue', () => {
  it('keeps progress as JSON text', () => {
    const value = serializeSessionProgressValue([
      { rep: 1, set_1: 80 },
      { rep: 2, set_1: 90 },
    ])

    expect(typeof value).toBe('string')
    expect(JSON.parse(value)).toEqual([
      { rep: 1, set_1: 80 },
      { rep: 2, set_1: 90 },
    ])
  })
})

describe('buildCurrentExerciseProgressUpsert', () => {
  it('links progress to the started session and session exercise row', () => {
    const [sessionExercise] = buildSessionExerciseRowsFromWorkingCopy(
      [sampleExercises[0]],
      'session-1',
      () => 'session-row-1',
    )

    expect(
      buildCurrentExerciseProgressUpsert({
        patientSessionId: 'session-1',
        sessionExercise,
        progressPoints: [{ rep: 1, set_1: 75 }],
      }),
    ).toEqual({
      patientSessionId: 'session-1',
      sessionExerciseId: 'session-row-1',
      value: JSON.stringify([{ rep: 1, set_1: 75 }]),
    })
  })
})

describe('resolveExerciseProgressForPersistence', () => {
  it('returns the checkpoint snapshot for non-current exercises', () => {
    expect(
      resolveExerciseProgressForPersistence({
        isCurrentExercise: false,
        snapshotProgress: [{ rep: 1, set_1: 70 }],
        liveProgress: [{ rep: 1, set_1: 55 }, { rep: 2 }],
      }),
    ).toEqual([{ rep: 1, set_1: 70 }])
  })

  it('prefers live completed progress when it is at least as complete as the snapshot', () => {
    expect(
      resolveExerciseProgressForPersistence({
        isCurrentExercise: true,
        snapshotProgress: [{ rep: 1, set_1: 70 }],
        liveProgress: [
          { rep: 1, set_1: 70 },
          { rep: 2, set_1: 80 },
          { rep: 3 },
        ],
      }),
    ).toEqual([
      { rep: 1, set_1: 70 },
      { rep: 2, set_1: 80 },
    ])
  })

  it('keeps the checkpoint snapshot when live progress is stale or empty', () => {
    expect(
      resolveExerciseProgressForPersistence({
        isCurrentExercise: true,
        snapshotProgress: [
          { rep: 1, set_1: 60 },
          { rep: 2, set_1: 65 },
        ],
        liveProgress: [{ rep: 1 }, { rep: 2 }, { rep: 3 }],
      }),
    ).toEqual([
      { rep: 1, set_1: 60 },
      { rep: 2, set_1: 65 },
    ])

    expect(
      resolveExerciseProgressForPersistence({
        isCurrentExercise: true,
        snapshotProgress: [{ rep: 1, set_1: 70 }],
        liveProgress: [{ rep: 1 }, { rep: 2 }, { rep: 3 }, { rep: 4 }],
      }),
    ).toEqual([{ rep: 1, set_1: 70 }])
  })
})

describe('buildSessionProgressUpserts', () => {
  let rowCounter = 0
  const sessionExerciseRows = buildSessionExerciseRowsFromWorkingCopy(
    sampleExercises,
    'session-1',
    () => `session-row-${++rowCounter}`,
  )

  it('persists partial progress for the current exercise after each set', () => {
    const upserts = buildSessionProgressUpserts({
      patientSessionId: 'session-1',
      sessionExerciseRows,
      progressByExerciseId: {},
      currentExerciseIndex: 0,
      currentExerciseProgress: [
        { rep: 1, set_1: 70 },
        { rep: 2, set_1: 80 },
      ],
    })

    expect(upserts).toEqual([
      {
        patientSessionId: 'session-1',
        sessionExerciseId: 'session-row-1',
        value: JSON.stringify([
          { rep: 1, set_1: 70 },
          { rep: 2, set_1: 80 },
        ]),
      },
      {
        patientSessionId: 'session-1',
        sessionExerciseId: 'session-row-2',
        value: JSON.stringify([]),
      },
    ])
  })

  it('retains interrupted-session progress for completed exercises', () => {
    const upserts = buildSessionProgressUpserts({
      patientSessionId: 'session-1',
      sessionExerciseRows,
      progressByExerciseId: {
        'ex-1': [
          { rep: 1, set_1: 100, set_2: 95, set_3: 90 },
          { rep: 2, set_1: 100, set_2: 95, set_3: 90 },
        ],
      },
      currentExerciseIndex: 1,
      currentExerciseProgress: [{ rep: 1, set_1: 55 }],
    })

    expect(JSON.parse(upserts[0]!.value)).toEqual([
      { rep: 1, set_1: 100, set_2: 95, set_3: 90 },
      { rep: 2, set_1: 100, set_2: 95, set_3: 90 },
    ])
    expect(JSON.parse(upserts[1]!.value)).toEqual([{ rep: 1, set_1: 55 }])
  })

  it('includes a local skip checkpoint snapshot at normal session end', () => {
    const upserts = buildSessionProgressUpserts({
      patientSessionId: 'session-1',
      sessionExerciseRows,
      progressByExerciseId: {
        'ex-1': [{ rep: 1, set_1: 70 }],
      },
      currentExerciseIndex: 1,
      currentExerciseProgress: [{ rep: 1, set_1: 55 }, { rep: 2 }],
    })

    expect(JSON.parse(upserts[0]!.value)).toEqual([{ rep: 1, set_1: 70 }])
    expect(JSON.parse(upserts[1]!.value)).toEqual([{ rep: 1, set_1: 55 }])
  })

  it('includes a local set-completion checkpoint snapshot at normal session end', () => {
    const upserts = buildSessionProgressUpserts({
      patientSessionId: 'session-1',
      sessionExerciseRows,
      progressByExerciseId: {
        'ex-2': [
          { rep: 1, set_1: 60 },
          { rep: 2, set_1: 65 },
        ],
      },
      currentExerciseIndex: 0,
      currentExerciseProgress: [{ rep: 1 }, { rep: 2 }, { rep: 3 }],
    })

    expect(JSON.parse(upserts[0]!.value)).toEqual([])
    expect(JSON.parse(upserts[1]!.value)).toEqual([
      { rep: 1, set_1: 60 },
      { rep: 2, set_1: 65 },
    ])
  })

  it('does not overwrite newer live progress with a stale local snapshot', () => {
    const upserts = buildSessionProgressUpserts({
      patientSessionId: 'session-1',
      sessionExerciseRows,
      progressByExerciseId: {
        'ex-1': [{ rep: 1, set_1: 70 }],
      },
      currentExerciseIndex: 0,
      currentExerciseProgress: [
        { rep: 1, set_1: 70 },
        { rep: 2, set_1: 80 },
        { rep: 3 },
      ],
    })

    expect(JSON.parse(upserts[0]!.value)).toEqual([
      { rep: 1, set_1: 70 },
      { rep: 2, set_1: 80 },
    ])
  })

  it('persists empty progress for unattempted exercises without invented rep values', () => {
    const upserts = buildSessionProgressUpserts({
      patientSessionId: 'session-1',
      sessionExerciseRows,
      progressByExerciseId: {},
      currentExerciseIndex: 1,
      currentExerciseProgress: [{ rep: 1 }, { rep: 2 }, { rep: 3 }, { rep: 4 }],
    })

    expect(JSON.parse(upserts[0]!.value)).toEqual([])
    expect(JSON.parse(upserts[1]!.value)).toEqual([])
  })
})
