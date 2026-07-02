import { describe, expect, it } from 'vitest'
import { buildSessionExerciseRowsFromWorkingCopy } from './patient-dashboard-session-launch.js'
import { buildExerciseSkipCheckpoint } from './session-progress-checkpoint.js'
import {
  extractCompletedProgressPoints,
  isSkipControlDisabled,
  resolveCurrentExerciseIndex,
  resolveForwardBackSkipTarget,
  shouldIgnoreProgressEventDuringPendingExerciseChange,
  type PendingExerciseChange,
} from './session-exercise-skip.js'
import type { CompleteExercise } from '@/types/models'

const sampleExercises: CompleteExercise[] = [
  {
    id: 'row-1',
    exerciseId: 'ex-1',
    sets: 2,
    reps: 3,
    restTime: 5,
    holdTime: 1,
    speed: 1,
    romMode: 0,
  },
  {
    id: 'row-2',
    exerciseId: 'ex-2',
    sets: 1,
    reps: 2,
    restTime: 4,
    holdTime: 2,
    speed: 1.5,
    romMode: 0,
  },
  {
    id: 'row-3',
    exerciseId: 'ex-3',
    sets: 1,
    reps: 2,
    restTime: 4,
    holdTime: 2,
    speed: 1.5,
    romMode: 0,
  },
]

describe('resolveCurrentExerciseIndex', () => {
  it('uses the active exercise id when it exists in the program', () => {
    expect(
      resolveCurrentExerciseIndex({
        exercises: sampleExercises,
        activeExerciseId: 'ex-2',
        fallbackIndex: 0,
      }),
    ).toBe(1)
  })

  it('returns findIndex result when the active exercise id is not found', () => {
    expect(
      resolveCurrentExerciseIndex({
        exercises: sampleExercises,
        activeExerciseId: 'missing',
        fallbackIndex: 2,
      }),
    ).toBe(-1)
  })

  it('uses the fallback index when exercises are unavailable', () => {
    expect(
      resolveCurrentExerciseIndex({
        exercises: undefined,
        activeExerciseId: 'ex-1',
        fallbackIndex: 2,
      }),
    ).toBe(2)
  })
})

describe('resolveForwardBackSkipTarget', () => {
  it('moves forward and back without wrapping around the exercise list', () => {
    expect(
      resolveForwardBackSkipTarget({
        currentExerciseIndex: 1,
        exerciseCount: 3,
        direction: 'forward',
      }),
    ).toBe(2)
    expect(
      resolveForwardBackSkipTarget({
        currentExerciseIndex: 1,
        exerciseCount: 3,
        direction: 'back',
      }),
    ).toBe(0)
  })

  it('returns null at the first and last exercise boundaries', () => {
    expect(
      resolveForwardBackSkipTarget({
        currentExerciseIndex: 0,
        exerciseCount: 3,
        direction: 'back',
      }),
    ).toBeNull()
    expect(
      resolveForwardBackSkipTarget({
        currentExerciseIndex: 2,
        exerciseCount: 3,
        direction: 'forward',
      }),
    ).toBeNull()
  })
})

describe('skip control disabled state', () => {
  it('disables forward at the last exercise and back at the first exercise', () => {
    expect(
      isSkipControlDisabled({
        direction: 'forward',
        currentExerciseIndex: 2,
        exerciseCount: 3,
        pendingExerciseChange: null,
      }),
    ).toBe(true)
    expect(
      isSkipControlDisabled({
        direction: 'back',
        currentExerciseIndex: 0,
        exerciseCount: 3,
        pendingExerciseChange: null,
      }),
    ).toBe(true)
  })

  it('disables both controls while a pending exercise change is in flight', () => {
    const pending: PendingExerciseChange = {
      targetExerciseIndex: 1,
      sourceExerciseIndex: 0,
      sourceExerciseId: 'ex-1',
    }

    expect(
      isSkipControlDisabled({
        direction: 'forward',
        currentExerciseIndex: 0,
        exerciseCount: 3,
        pendingExerciseChange: pending,
      }),
    ).toBe(true)
    expect(
      isSkipControlDisabled({
        direction: 'back',
        currentExerciseIndex: 1,
        exerciseCount: 3,
        pendingExerciseChange: pending,
      }),
    ).toBe(true)
  })
})

describe('extractCompletedProgressPoints', () => {
  it('keeps only completed rep measurements and drops unattempted placeholders', () => {
    const completed = extractCompletedProgressPoints([
      { rep: 1, set_1: 70 },
      { rep: 2 },
      { rep: 3 },
    ])

    expect(completed).toEqual([{ rep: 1, set_1: 70 }])
  })
})

describe('buildExerciseSkipCheckpoint', () => {
  let rowCounter = 0
  const sessionExerciseRows = buildSessionExerciseRowsFromWorkingCopy(
    sampleExercises,
    'session-1',
    () => `session-row-${++rowCounter}`,
  )

  it('preserves partial progress for a skipped exercise', () => {
    const checkpoint = buildExerciseSkipCheckpoint({
      patientSessionId: 'session-1',
      sessionExerciseRows,
      currentExerciseIndex: 0,
      progressByExerciseId: {},
      currentExerciseProgress: [{ rep: 1, set_1: 70 }, { rep: 2 }, { rep: 3 }],
    })

    expect(checkpoint.upsert).toEqual({
      patientSessionId: 'session-1',
      sessionExerciseId: 'session-row-1',
      value: JSON.stringify([{ rep: 1, set_1: 70 }]),
    })
    expect(checkpoint.progressByExerciseId).toEqual({
      'ex-1': [{ rep: 1, set_1: 70 }],
    })
  })

  it('does not synthesize progress when skipping with no completed reps', () => {
    const checkpoint = buildExerciseSkipCheckpoint({
      patientSessionId: 'session-1',
      sessionExerciseRows,
      currentExerciseIndex: 0,
      progressByExerciseId: {},
      currentExerciseProgress: [{ rep: 1 }, { rep: 2 }, { rep: 3 }],
    })

    expect(checkpoint.upsert).toBeNull()
    expect(checkpoint.progressByExerciseId).toEqual({})
  })
})

describe('shouldIgnoreProgressEventDuringPendingExerciseChange', () => {
  const pending: PendingExerciseChange = {
    targetExerciseIndex: 1,
    sourceExerciseIndex: 0,
    sourceExerciseId: 'ex-1',
  }

  it('ignores late headset events from the skipped exercise', () => {
    expect(
      shouldIgnoreProgressEventDuringPendingExerciseChange({
        pendingExerciseChange: pending,
        eventExerciseIndex: 0,
        eventExerciseId: 'ex-1',
      }),
    ).toBe(true)
  })

  it('does not ignore events once the pending change has cleared', () => {
    expect(
      shouldIgnoreProgressEventDuringPendingExerciseChange({
        pendingExerciseChange: null,
        eventExerciseIndex: 0,
        eventExerciseId: 'ex-1',
      }),
    ).toBe(false)
  })
})
