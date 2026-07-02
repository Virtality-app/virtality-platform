import { describe, expect, it } from 'vitest'
import type { CompleteExercise } from '@/types/models'
import {
  applyRepEndToFlow,
  applySetEndToFlow,
  acknowledgeExerciseChangeInFlow,
  completeSessionInFlow,
  createSkipSafeProgressFlowState,
  failPendingExerciseChangeInFlow,
  interruptSessionInFlow,
  requestExerciseSkipInFlow,
} from './skip-safe-progress-flow.js'
import {
  isDirectExerciseSelectionDisabled,
  isSkipControlDisabled,
  resolveExerciseListHighlightState,
} from './session-exercise-skip.js'

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

function createFlowState(startingExerciseIndex = 0) {
  let rowCounter = 0

  return createSkipSafeProgressFlowState({
    patientSessionId: 'session-1',
    exercises: sampleExercises,
    createRowId: () => `session-row-${++rowCounter}`,
    startingExerciseIndex,
  })
}

function completeAllRepsInCurrentSet(
  state: ReturnType<typeof createFlowState>,
  progress = 0.8,
) {
  let next = state

  for (let rep = 0; rep < 3; rep += 1) {
    const result = applyRepEndToFlow(
      next,
      JSON.stringify({ previousRep: rep, progress }),
    )
    next = result.state
  }

  return next
}

describe('skip-safe active-session progress flow regression', () => {
  it('persists completed rep measurements through set checkpoint saves', () => {
    let state = createFlowState()
    state = completeAllRepsInCurrentSet(state)

    const setEnd = applySetEndToFlow(state, JSON.stringify({ previousSet: 1 }))

    expect(JSON.parse(setEnd.remoteUpserts[0]!.value)).toEqual([
      { rep: 1, set_1: 80 },
      { rep: 2, set_1: 80 },
      { rep: 3, set_1: 80 },
    ])
    expect(setEnd.state.progressByExerciseId).toEqual({})
    expect(setEnd.state.headsetConfirmedExerciseIndex).toBe(0)
  })

  it('preserves partial progress when skipping forward or back', () => {
    let state = createFlowState()
    const afterRep = applyRepEndToFlow(
      state,
      JSON.stringify({ previousRep: 0, progress: 0.7 }),
    ).state

    const forwardSkip = requestExerciseSkipInFlow(afterRep, { kind: 'forward' })

    expect(forwardSkip.skipRequested).toBe(true)
    expect(forwardSkip.state.pendingExerciseChange).toEqual({
      targetExerciseIndex: 1,
      sourceExerciseIndex: 0,
      sourceExerciseId: 'ex-1',
    })
    expect(JSON.parse(forwardSkip.remoteUpserts[0]!.value)).toEqual([
      { rep: 1, set_1: 70 },
    ])
    expect(forwardSkip.state.progressByExerciseId).toEqual({
      'ex-1': [{ rep: 1, set_1: 70 }],
    })

    const acked = acknowledgeExerciseChangeInFlow(forwardSkip.state)
    const withProgress = applyRepEndToFlow(
      acked.state,
      JSON.stringify({ previousRep: 0, progress: 0.75 }),
    ).state
    const backSkip = requestExerciseSkipInFlow(withProgress, { kind: 'back' })

    expect(backSkip.skipRequested).toBe(true)
    expect(JSON.parse(backSkip.remoteUpserts[0]!.value)).toEqual([
      { rep: 1, set_1: 75 },
    ])
  })

  it('treats direct exercise selection as a skip with the same preservation rules', () => {
    let state = createFlowState()
    state = applyRepEndToFlow(
      state,
      JSON.stringify({ previousRep: 0, progress: 0.8 }),
    ).state
    state = applyRepEndToFlow(
      state,
      JSON.stringify({ previousRep: 1, progress: 0.65 }),
    ).state

    const directSkip = requestExerciseSkipInFlow(state, {
      kind: 'direct',
      targetExerciseIndex: 2,
    })

    expect(directSkip.skipRequested).toBe(true)
    expect(directSkip.state.pendingExerciseChange?.targetExerciseIndex).toBe(2)
    expect(JSON.parse(directSkip.remoteUpserts[0]!.value)).toEqual([
      { rep: 1, set_1: 80 },
      { rep: 2, set_1: 65 },
    ])
    expect(
      requestExerciseSkipInFlow(state, {
        kind: 'direct',
        targetExerciseIndex: 0,
      }).skipRequested,
    ).toBe(false)
  })

  it('promotes the pending target on acknowledgement and recovers on failure', () => {
    const skip = requestExerciseSkipInFlow(createFlowState(), {
      kind: 'forward',
    })

    expect(
      resolveExerciseListHighlightState({
        exerciseIndex: 0,
        headsetConfirmedExerciseIndex: 0,
        pendingExerciseChange: skip.state.pendingExerciseChange,
      }),
    ).toBe('confirmed')
    expect(
      resolveExerciseListHighlightState({
        exerciseIndex: 1,
        headsetConfirmedExerciseIndex: 0,
        pendingExerciseChange: skip.state.pendingExerciseChange,
      }),
    ).toBe('pending')

    const acked = acknowledgeExerciseChangeInFlow(skip.state)
    expect(acked.acknowledged).toBe(true)
    expect(acked.state.headsetConfirmedExerciseIndex).toBe(1)
    expect(acked.state.pendingExerciseChange).toBeNull()

    const failedSkip = requestExerciseSkipInFlow(createFlowState(), {
      kind: 'forward',
    })
    const failed = failPendingExerciseChangeInFlow(failedSkip.state)

    expect(failed.failed).toBe(true)
    expect(failed.state.headsetConfirmedExerciseIndex).toBe(0)
    expect(failed.state.pendingExerciseChange).toBeNull()
    expect(
      isSkipControlDisabled({
        direction: 'forward',
        currentExerciseIndex: failed.state.headsetConfirmedExerciseIndex,
        exerciseCount: sampleExercises.length,
        pendingExerciseChange: failed.state.pendingExerciseChange,
      }),
    ).toBe(false)
  })

  it('retries unsaved skip checkpoint snapshots at normal session end', () => {
    const afterRep = applyRepEndToFlow(
      createFlowState(),
      JSON.stringify({ previousRep: 0, progress: 0.72 }),
    ).state
    const skipped = requestExerciseSkipInFlow(
      afterRep,
      { kind: 'forward' },
      {
        persistSucceeds: false,
      },
    )

    expect(skipped.remoteUpserts).toEqual([])
    expect(skipped.state.progressByExerciseId).toEqual({
      'ex-1': [{ rep: 1, set_1: 72 }],
    })

    const acked = acknowledgeExerciseChangeInFlow(skipped.state)
    const sessionEnd = completeSessionInFlow(acked.state)

    expect(JSON.parse(sessionEnd.remoteUpserts[0]!.value)).toEqual([
      { rep: 1, set_1: 72 },
    ])
    expect(JSON.parse(sessionEnd.remoteUpserts[1]!.value)).toEqual([])
    expect(JSON.parse(sessionEnd.remoteUpserts[2]!.value)).toEqual([])
  })

  it('recovers checkpoint snapshots when a session is interrupted', () => {
    let state = createFlowState()
    state = applyRepEndToFlow(
      state,
      JSON.stringify({ previousRep: 0, progress: 0.6 }),
    ).state
    const skipped = requestExerciseSkipInFlow(state, { kind: 'forward' })
    const acked = acknowledgeExerciseChangeInFlow(skipped.state)
    const interrupted = interruptSessionInFlow(acked.state)

    expect(JSON.parse(interrupted.remoteUpserts[0]!.value)).toEqual([
      { rep: 1, set_1: 60 },
    ])
    expect(JSON.parse(interrupted.remoteUpserts[1]!.value)).toEqual([])
    expect(interrupted.state.headsetConfirmedExerciseIndex).toBe(0)
    expect(interrupted.state.pendingExerciseChange).toBeNull()
  })

  it('persists final-exercise progress before resetting the current exercise index', () => {
    let state = createFlowState(2)
    state = applyRepEndToFlow(
      state,
      JSON.stringify({ previousRep: 0, progress: 0.5 }),
    ).state
    state = applyRepEndToFlow(
      state,
      JSON.stringify({ previousRep: 1, progress: 0.6 }),
    ).state

    const finalSetEnd = applySetEndToFlow(
      state,
      JSON.stringify({ previousSet: 1 }),
    )

    expect(finalSetEnd.remoteUpserts[0]!.sessionExerciseId).toBe(
      'session-row-3',
    )
    expect(JSON.parse(finalSetEnd.remoteUpserts[0]!.value)).toEqual([
      { rep: 1, set_1: 50 },
      { rep: 2, set_1: 60 },
    ])
    expect(finalSetEnd.state.headsetConfirmedExerciseIndex).toBe(0)
  })

  it('ignores late progress events from the skipped exercise while a change is pending', () => {
    const skipped = requestExerciseSkipInFlow(createFlowState(), {
      kind: 'forward',
    })

    const lateRep = applyRepEndToFlow(
      skipped.state,
      JSON.stringify({ previousRep: 1, progress: 0.9 }),
    )
    const lateSet = applySetEndToFlow(
      lateRep.state,
      JSON.stringify({ previousSet: 1 }),
    )

    expect(lateRep.state.currentExerciseProgress).toEqual(
      skipped.state.currentExerciseProgress,
    )
    expect(lateSet.remoteUpserts).toEqual([])
    expect(
      isDirectExerciseSelectionDisabled({
        pendingExerciseChange: skipped.state.pendingExerciseChange,
      }),
    ).toBe(true)
  })

  it('walks the full skip-safe flow end to end', () => {
    let state = createFlowState()

    state = applyRepEndToFlow(
      state,
      JSON.stringify({ previousRep: 0, progress: 0.7 }),
    ).state
    state = applySetEndToFlow(state, JSON.stringify({ previousSet: 1 })).state

    const forwardSkip = requestExerciseSkipInFlow(
      state,
      { kind: 'forward' },
      {
        persistSucceeds: false,
      },
    )
    state = acknowledgeExerciseChangeInFlow(forwardSkip.state).state

    state = applyRepEndToFlow(
      state,
      JSON.stringify({ previousRep: 0, progress: 0.5 }),
    ).state
    const directSkip = requestExerciseSkipInFlow(state, {
      kind: 'direct',
      targetExerciseIndex: 2,
    })
    state = acknowledgeExerciseChangeInFlow(directSkip.state).state

    const sessionEnd = completeSessionInFlow(state)
    const persistedByExerciseId = Object.fromEntries(
      state.sessionExerciseRows.map((row, index) => [
        row.exerciseId,
        JSON.parse(sessionEnd.remoteUpserts[index]!.value),
      ]),
    )

    expect(persistedByExerciseId).toEqual({
      'ex-1': [{ rep: 1, set_1: 70 }],
      'ex-2': [{ rep: 1, set_1: 50 }],
      'ex-3': [],
    })
    expect(forwardSkip.state.progressByExerciseId['ex-1']).toEqual([
      { rep: 1, set_1: 70 },
    ])
    expect(directSkip.state.progressByExerciseId['ex-2']).toEqual([
      { rep: 1, set_1: 50 },
    ])
  })
})
