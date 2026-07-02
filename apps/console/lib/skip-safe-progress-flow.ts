import type { CompleteExercise, ProgressDataPoint } from '@/types/models'
import {
  applyCompletedRepToPlotData,
  normalizeRepEndPayload,
  normalizeSetEndPayload,
} from './progress-event-normalization'
import { buildSessionExerciseRowsFromWorkingCopy } from './patient-dashboard-session-launch'
import type { SessionExerciseRowInput } from './patient-dashboard-session-launch'
import {
  buildExerciseSkipCheckpoint,
  buildSetCompletionCheckpoint,
  mutableProgressByExerciseId,
} from './session-progress-checkpoint'
import {
  isDirectExerciseSelectionDisabled,
  resolveDirectExerciseSkipTarget,
  resolveForwardBackSkipTarget,
  shouldIgnoreProgressEventDuringPendingExerciseChange,
  shouldPromotePendingExerciseOnAck,
  type PendingExerciseChange,
  type SkipDirection,
} from './session-exercise-skip'
import {
  buildSessionProgressUpserts,
  type SessionProgressUpsertInput,
} from './session-progress-persistence'

export type SkipSafeProgressFlowState = {
  patientSessionId: string
  sessionExerciseRows: ReadonlyArray<SessionExerciseRowInput>
  headsetConfirmedExerciseIndex: number
  pendingExerciseChange: PendingExerciseChange | null
  progressByExerciseId: Record<string, ProgressDataPoint[]>
  currentExerciseProgress: ProgressDataPoint[]
  currSet: number
  currRep: number
}

export type SkipSafeProgressFlowActionResult = {
  state: SkipSafeProgressFlowState
  remoteUpserts: SessionProgressUpsertInput[]
}

export type ExerciseSkipRequest =
  | { kind: 'forward' }
  | { kind: 'back' }
  | { kind: 'direct'; targetExerciseIndex: number }

type PersistOptions = {
  persistSucceeds?: boolean
}

function createEmptyPlotData(reps: number): ProgressDataPoint[] {
  return Array.from({ length: reps }, (_, index) => ({ rep: index + 1 }))
}

function getCurrentSessionExercise(
  state: SkipSafeProgressFlowState,
): SessionExerciseRowInput | undefined {
  return state.sessionExerciseRows[state.headsetConfirmedExerciseIndex]
}

function clearCurrentExerciseProgress(
  state: SkipSafeProgressFlowState,
): SkipSafeProgressFlowState {
  const currentExercise = getCurrentSessionExercise(state)

  return {
    ...state,
    currSet: 0,
    currRep: 0,
    currentExerciseProgress: createEmptyPlotData(currentExercise?.reps ?? 0),
  }
}

function shouldIgnoreProgressEvent(state: SkipSafeProgressFlowState): boolean {
  const currentExercise = getCurrentSessionExercise(state)

  if (!currentExercise) {
    return false
  }

  return shouldIgnoreProgressEventDuringPendingExerciseChange({
    pendingExerciseChange: state.pendingExerciseChange,
    eventExerciseIndex: state.headsetConfirmedExerciseIndex,
    eventExerciseId: currentExercise.exerciseId,
  })
}

function recordRemoteUpsert(
  result: SkipSafeProgressFlowActionResult,
  upsert: SessionProgressUpsertInput | null,
  options?: PersistOptions,
): SkipSafeProgressFlowActionResult {
  if (!upsert) {
    return result
  }

  if (options?.persistSucceeds === false) {
    return result
  }

  return {
    ...result,
    remoteUpserts: [...result.remoteUpserts, upsert],
  }
}

export function createSkipSafeProgressFlowState(input: {
  patientSessionId: string
  exercises: ReadonlyArray<CompleteExercise>
  createRowId: () => string
  startingExerciseIndex?: number
}): SkipSafeProgressFlowState {
  const sessionExerciseRows = buildSessionExerciseRowsFromWorkingCopy(
    [...input.exercises],
    input.patientSessionId,
    input.createRowId,
  )
  const startingExerciseIndex = input.startingExerciseIndex ?? 0
  const startingExercise = sessionExerciseRows[startingExerciseIndex]

  return {
    patientSessionId: input.patientSessionId,
    sessionExerciseRows,
    headsetConfirmedExerciseIndex: startingExerciseIndex,
    pendingExerciseChange: null,
    progressByExerciseId: {},
    currentExerciseProgress: createEmptyPlotData(startingExercise?.reps ?? 0),
    currSet: 0,
    currRep: 0,
  }
}

export function applyRepEndToFlow(
  state: SkipSafeProgressFlowState,
  payload: string,
): SkipSafeProgressFlowActionResult {
  if (shouldIgnoreProgressEvent(state)) {
    return { state, remoteUpserts: [] }
  }

  const normalized = normalizeRepEndPayload(payload)

  if (!normalized.ok) {
    return { state, remoteUpserts: [] }
  }

  const { completedRep, progress } = normalized.event
  const activeSet = state.currSet + 1
  const currentExerciseProgress = applyCompletedRepToPlotData(
    state.currentExerciseProgress,
    {
      completedRep,
      activeSet,
      progressPercent: progress * 100,
    },
  )

  return {
    state: {
      ...state,
      currRep: completedRep - 1,
      currentExerciseProgress,
    },
    remoteUpserts: [],
  }
}

export function applySetEndToFlow(
  state: SkipSafeProgressFlowState,
  payload: string,
  options?: PersistOptions,
): SkipSafeProgressFlowActionResult {
  if (shouldIgnoreProgressEvent(state)) {
    return { state, remoteUpserts: [] }
  }

  const normalized = normalizeSetEndPayload(payload)

  if (!normalized.ok) {
    return { state, remoteUpserts: [] }
  }

  const { completedSet } = normalized.event
  const currentExerciseIndex = state.headsetConfirmedExerciseIndex
  const checkpoint = buildSetCompletionCheckpoint({
    patientSessionId: state.patientSessionId,
    sessionExerciseRows: state.sessionExerciseRows,
    currentExerciseIndex,
    progressByExerciseId: state.progressByExerciseId,
    currentExerciseProgress: state.currentExerciseProgress,
    completedSet,
    lastCompletedRepIndex: state.currRep,
    isLastExercise:
      currentExerciseIndex === state.sessionExerciseRows.length - 1,
  })

  let nextState: SkipSafeProgressFlowState = {
    ...state,
    currSet: completedSet,
    progressByExerciseId: mutableProgressByExerciseId(
      checkpoint.progressByExerciseId,
    ),
    headsetConfirmedExerciseIndex: checkpoint.nextCurrentExerciseIndex,
  }

  if (
    checkpoint.nextCurrentExerciseIndex !== currentExerciseIndex &&
    checkpoint.nextCurrentExerciseIndex < state.sessionExerciseRows.length
  ) {
    nextState = clearCurrentExerciseProgress(nextState)
  }

  return recordRemoteUpsert(
    { state: nextState, remoteUpserts: [] },
    checkpoint.upsert,
    options,
  )
}

export function requestExerciseSkipInFlow(
  state: SkipSafeProgressFlowState,
  request: ExerciseSkipRequest,
  options?: PersistOptions,
): SkipSafeProgressFlowActionResult & { skipRequested: boolean } {
  if (
    isDirectExerciseSelectionDisabled({
      pendingExerciseChange: state.pendingExerciseChange,
    })
  ) {
    return { state, remoteUpserts: [], skipRequested: false }
  }

  const targetIndex = resolveSkipTargetIndex(state, request)

  if (targetIndex === null) {
    return { state, remoteUpserts: [], skipRequested: false }
  }

  const sourceIndex = state.headsetConfirmedExerciseIndex
  const sourceExercise = state.sessionExerciseRows[sourceIndex]
  const targetExercise = state.sessionExerciseRows[targetIndex]

  if (!sourceExercise || !targetExercise || targetIndex === sourceIndex) {
    return { state, remoteUpserts: [], skipRequested: false }
  }

  const pendingExerciseChange: PendingExerciseChange = {
    targetExerciseIndex: targetIndex,
    sourceExerciseIndex: sourceIndex,
    sourceExerciseId: sourceExercise.exerciseId,
  }

  const checkpoint = buildExerciseSkipCheckpoint({
    patientSessionId: state.patientSessionId,
    sessionExerciseRows: state.sessionExerciseRows,
    currentExerciseIndex: sourceIndex,
    progressByExerciseId: state.progressByExerciseId,
    currentExerciseProgress: state.currentExerciseProgress,
  })

  const nextState: SkipSafeProgressFlowState = {
    ...state,
    pendingExerciseChange,
    progressByExerciseId: mutableProgressByExerciseId(
      checkpoint.progressByExerciseId,
    ),
  }

  const result = recordRemoteUpsert(
    { state: nextState, remoteUpserts: [] },
    checkpoint.upsert,
    options,
  )

  return { ...result, skipRequested: true }
}

function resolveSkipTargetIndex(
  state: SkipSafeProgressFlowState,
  request: ExerciseSkipRequest,
): number | null {
  if (request.kind === 'direct') {
    return resolveDirectExerciseSkipTarget({
      currentExerciseIndex: state.headsetConfirmedExerciseIndex,
      targetExerciseIndex: request.targetExerciseIndex,
    })
  }

  return resolveForwardBackSkipTarget({
    currentExerciseIndex: state.headsetConfirmedExerciseIndex,
    exerciseCount: state.sessionExerciseRows.length,
    direction: request.kind satisfies SkipDirection,
  })
}

export function acknowledgeExerciseChangeInFlow(
  state: SkipSafeProgressFlowState,
): SkipSafeProgressFlowActionResult & { acknowledged: boolean } {
  const pending = state.pendingExerciseChange

  if (
    !shouldPromotePendingExerciseOnAck({
      pendingExerciseChange: pending,
    }) ||
    !pending
  ) {
    return { state, remoteUpserts: [], acknowledged: false }
  }

  const nextState = clearCurrentExerciseProgress({
    ...state,
    headsetConfirmedExerciseIndex: pending.targetExerciseIndex,
    pendingExerciseChange: null,
  })

  return { state: nextState, remoteUpserts: [], acknowledged: true }
}

export function failPendingExerciseChangeInFlow(
  state: SkipSafeProgressFlowState,
): SkipSafeProgressFlowActionResult & { failed: boolean } {
  if (!state.pendingExerciseChange) {
    return { state, remoteUpserts: [], failed: false }
  }

  return {
    state: {
      ...state,
      pendingExerciseChange: null,
    },
    remoteUpserts: [],
    failed: true,
  }
}

export function buildSessionEndProgressUpserts(
  state: SkipSafeProgressFlowState,
): SessionProgressUpsertInput[] {
  return buildSessionProgressUpserts({
    patientSessionId: state.patientSessionId,
    sessionExerciseRows: state.sessionExerciseRows,
    progressByExerciseId: state.progressByExerciseId,
    currentExerciseIndex: state.headsetConfirmedExerciseIndex,
    currentExerciseProgress: state.currentExerciseProgress,
  })
}

export function completeSessionInFlow(
  state: SkipSafeProgressFlowState,
): SkipSafeProgressFlowActionResult {
  return {
    state: {
      ...state,
      headsetConfirmedExerciseIndex: 0,
      pendingExerciseChange: null,
      currentExerciseProgress: [],
      progressByExerciseId: {},
      currSet: 0,
      currRep: 0,
    },
    remoteUpserts: buildSessionEndProgressUpserts(state),
  }
}

export function interruptSessionInFlow(
  state: SkipSafeProgressFlowState,
): SkipSafeProgressFlowActionResult {
  return completeSessionInFlow(state)
}
