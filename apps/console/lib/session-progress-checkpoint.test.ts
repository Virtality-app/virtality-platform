import { describe, expect, it } from 'vitest'
import { buildSessionExerciseRowsFromWorkingCopy } from './patient-dashboard-session-launch.js'
import {
  buildSetCompletionCheckpoint,
  isExerciseLastSet,
  shouldResetLiveExerciseAfterSetCompletion,
} from './session-progress-checkpoint.js'
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
]

describe('isExerciseLastSet', () => {
  it('is true only when the final prescribed set and rep are complete', () => {
    expect(
      isExerciseLastSet({
        completedSet: 2,
        lastCompletedRepIndex: 2,
        prescribedSets: 2,
        prescribedReps: 3,
      }),
    ).toBe(true)

    expect(
      isExerciseLastSet({
        completedSet: 1,
        lastCompletedRepIndex: 2,
        prescribedSets: 2,
        prescribedReps: 3,
      }),
    ).toBe(false)

    expect(
      isExerciseLastSet({
        completedSet: 2,
        lastCompletedRepIndex: 1,
        prescribedSets: 2,
        prescribedReps: 3,
      }),
    ).toBe(false)
  })
})

describe('shouldResetLiveExerciseAfterSetCompletion', () => {
  it('is true when the checkpoint advances to a valid exercise index', () => {
    expect(
      shouldResetLiveExerciseAfterSetCompletion({
        currentExerciseIndex: 2,
        nextCurrentExerciseIndex: 0,
        exerciseCount: 3,
      }),
    ).toBe(true)
  })

  it('is false when the checkpoint keeps the same exercise index', () => {
    expect(
      shouldResetLiveExerciseAfterSetCompletion({
        currentExerciseIndex: 1,
        nextCurrentExerciseIndex: 1,
        exerciseCount: 3,
      }),
    ).toBe(false)
  })

  it('is false when the next index is outside the exercise list', () => {
    expect(
      shouldResetLiveExerciseAfterSetCompletion({
        currentExerciseIndex: 1,
        nextCurrentExerciseIndex: 3,
        exerciseCount: 3,
      }),
    ).toBe(false)
  })
})

describe('buildSetCompletionCheckpoint', () => {
  let rowCounter = 0
  const sessionExerciseRows = buildSessionExerciseRowsFromWorkingCopy(
    sampleExercises,
    'session-1',
    () => `session-row-${++rowCounter}`,
  )

  it('persists normal set completion through the shared checkpoint path', () => {
    const currentExerciseProgress = [
      { rep: 1, set_1: 70 },
      { rep: 2, set_1: 80 },
      { rep: 3, set_1: 90 },
    ]

    const checkpoint = buildSetCompletionCheckpoint({
      patientSessionId: 'session-1',
      sessionExerciseRows,
      currentExerciseIndex: 0,
      progressByExerciseId: {},
      currentExerciseProgress,
      completedSet: 1,
      lastCompletedRepIndex: 2,
      isLastExercise: false,
    })

    expect(checkpoint.upsert).toEqual({
      patientSessionId: 'session-1',
      sessionExerciseId: 'session-row-1',
      value: JSON.stringify(currentExerciseProgress),
    })
    expect(checkpoint.progressByExerciseId).toEqual({})
    expect(checkpoint.nextCurrentExerciseIndex).toBe(0)
  })

  it('persists final-exercise progress before resetting the current exercise index', () => {
    const currentExerciseProgress = [
      { rep: 1, set_1: 60 },
      { rep: 2, set_1: 65 },
    ]

    const checkpoint = buildSetCompletionCheckpoint({
      patientSessionId: 'session-1',
      sessionExerciseRows,
      currentExerciseIndex: 1,
      progressByExerciseId: {
        'ex-1': [{ rep: 1, set_1: 100, set_2: 95 }],
      },
      currentExerciseProgress,
      completedSet: 1,
      lastCompletedRepIndex: 1,
      isLastExercise: true,
    })

    expect(checkpoint.upsert).toEqual({
      patientSessionId: 'session-1',
      sessionExerciseId: 'session-row-2',
      value: JSON.stringify(currentExerciseProgress),
    })
    expect(checkpoint.progressByExerciseId).toEqual({
      'ex-1': [{ rep: 1, set_1: 100, set_2: 95 }],
      'ex-2': currentExerciseProgress,
    })
    expect(checkpoint.nextCurrentExerciseIndex).toBe(0)
  })
})
