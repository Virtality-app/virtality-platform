import { Store } from 'tinybase'
import {
  acknowledgeExerciseChangeInFlow,
  applyHeadsetExerciseAdvanceInFlow,
  applyRepEndToFlow,
  applySetEndToFlow,
} from '@/lib/skip-safe-progress-flow'
import usePatientLocalProgress from './use-patient-local-progress'
import type { SessionFlowRefs } from './use-session-flow-refs'
import type { PendingExerciseChangeHandlers } from './use-pending-exercise-change'
import type { SessionPersistence } from './use-session-persistence'
import type { SessionPlotHandlers } from './use-session-plot'
import type { DashboardHandler, DashboardState } from './types'

interface useExerciseProgressHandlersProps {
  flow: SessionFlowRefs
  pendingChange: PendingExerciseChangeHandlers
  sessionPlot: SessionPlotHandlers
  persistRemoteUpserts: SessionPersistence['persistRemoteUpserts']
  exercises: DashboardState['exercises']
  activeExerciseData: DashboardState['activeExerciseData']
  setActiveExerciseData: DashboardHandler['setActiveExerciseData']
  patientId: string
  store?: Store
}

const useExerciseProgressHandlers = ({
  flow,
  pendingChange,
  sessionPlot,
  persistRemoteUpserts,
  exercises,
  activeExerciseData,
  setActiveExerciseData,
  patientId,
  store,
}: useExerciseProgressHandlersProps) => {
  const { recordRepProgress } = usePatientLocalProgress(patientId, store)
  const { syncPlotFromFlowState } = sessionPlot

  const applyExerciseAtIndex = (index: number) => {
    const exercise = exercises?.[index]

    if (!exercise) {
      return
    }

    flow.setConfirmedExerciseIndex(index)
    setActiveExerciseData({
      id: exercise.exerciseId,
      currentRep: 0,
      currentSet: 1,
      totalReps: exercise.reps,
      totalSets: exercise.sets,
    })
  }

  const handleChangeExercise = (data: string) => {
    const result = applyHeadsetExerciseAdvanceInFlow(flow.readFlowState(), data)

    if (!result.advanced) {
      return
    }

    flow.writeFlowState(result.state)
    applyExerciseAtIndex(result.state.headsetConfirmedExerciseIndex)
    syncPlotFromFlowState(result.state)
  }

  const handleChangeExerciseAck = () => {
    const result = acknowledgeExerciseChangeInFlow(flow.readFlowState())

    if (!result.acknowledged) {
      return
    }

    flow.writeFlowState(result.state)
    pendingChange.clearPendingExerciseChange()
    applyExerciseAtIndex(result.state.headsetConfirmedExerciseIndex)
    syncPlotFromFlowState(result.state)
  }

  const handleRepEnd = (payload: unknown) => {
    const flowState = flow.readFlowState()

    if (!flow.canPersistFlowState(flowState)) {
      return
    }

    const result = applyRepEndToFlow(flowState, payload)

    if (!result.applied) {
      return
    }

    const currentExercise = exercises![flow.currExerciseRef.current]

    flow.writeFlowState(result.state)
    syncPlotFromFlowState(result.state)
    setActiveExerciseData({
      ...activeExerciseData,
      currentRep: result.completedRep,
    })

    recordRepProgress({
      exercise: currentExercise,
      progress: result.progress,
      progressByExerciseId: flow.progressDataRef.current,
      currentExerciseProgress: result.state.currentExerciseProgress,
    })
  }

  const handleSetEnd = async (payload: unknown) => {
    const flowState = flow.readFlowState()

    if (!flow.canPersistFlowState(flowState)) {
      return
    }

    const result = applySetEndToFlow(flowState, payload)

    if (!result.applied) {
      return
    }

    flow.writeFlowState(result.state)
    setActiveExerciseData({
      ...activeExerciseData,
      currentSet: result.state.currSet + 1,
    })

    if (result.advancedToNextExercise) {
      applyExerciseAtIndex(result.state.headsetConfirmedExerciseIndex)
      syncPlotFromFlowState(result.state)
    }

    try {
      await persistRemoteUpserts(result.remoteUpserts)
    } catch (error) {
      console.error(error)
    }
  }

  return {
    handleChangeExercise,
    handleChangeExerciseAck,
    handleRepEnd,
    handleSetEnd,
  }
}

export default useExerciseProgressHandlers
