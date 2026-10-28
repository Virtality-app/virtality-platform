import {
  isDirectExerciseSelectionDisabled,
  type SkipDirection,
} from '@/lib/session-exercise-skip'
import {
  requestExerciseSkipInFlow,
  type ExerciseSkipRequest,
} from '@/lib/skip-safe-progress-flow'
import type { SessionFlowRefs } from './use-session-flow-refs'
import type { PendingExerciseChangeHandlers } from './use-pending-exercise-change'
import type { SessionPersistence } from './use-session-persistence'
import type { DashboardState } from './types'

interface useExerciseSkipRequestProps {
  flow: SessionFlowRefs
  pendingChange: PendingExerciseChangeHandlers
  persistRemoteUpserts: SessionPersistence['persistRemoteUpserts']
  programState: DashboardState['programState']
  exercises: DashboardState['exercises']
  selectedDevice: DashboardState['selectedDevice']
}

const useExerciseSkipRequest = ({
  flow,
  pendingChange,
  persistRemoteUpserts,
  programState,
  exercises,
  selectedDevice,
}: useExerciseSkipRequestProps) => {
  const canRequestExerciseSkip = () =>
    programState === 'started' &&
    Boolean(exercises?.length) &&
    !isDirectExerciseSelectionDisabled({
      pendingExerciseChange: flow.pendingExerciseChangeRef.current,
    })

  const requestExerciseSkip = async (request: ExerciseSkipRequest) => {
    if (!canRequestExerciseSkip()) {
      return
    }

    const flowState = flow.readFlowState()
    const result = requestExerciseSkipInFlow(flowState, request, {
      persistSucceeds: flow.canPersistFlowState(flowState),
    })

    if (!result.skipRequested || !result.state.pendingExerciseChange) {
      return
    }

    flow.writeFlowState(result.state)
    pendingChange.trackPendingExerciseChange(result.state.pendingExerciseChange)
    try {
      await persistRemoteUpserts(result.remoteUpserts)
    } catch (error) {
      console.error(error)
    }

    const targetExercise =
      exercises[result.state.pendingExerciseChange.targetExerciseIndex]
    if (targetExercise) {
      selectedDevice?.events.program.ChangeExercise(targetExercise.exerciseId)
    }
  }

  const requestForwardBackSkip = async (direction: SkipDirection) => {
    await requestExerciseSkip({ kind: direction })
  }

  const requestDirectExerciseSelection = async (targetIndex: number) => {
    await requestExerciseSkip({
      kind: 'direct',
      targetExerciseIndex: targetIndex,
    })
  }

  return { requestForwardBackSkip, requestDirectExerciseSelection }
}

export default useExerciseSkipRequest
