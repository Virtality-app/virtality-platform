import { ProgramStatus } from '@/types/models'
import { PROGRAM_EVENT } from '@virtality/shared/types'
import { notify } from '@/lib/notify'
import {
  completeSessionInFlow,
  interruptSessionInFlow,
} from '@/lib/skip-safe-progress-flow'
import type { SessionFlowRefs } from './use-session-flow-refs'
import type { SessionPersistence } from './use-session-persistence'
import type { DashboardHandler, DashboardState } from './types'

interface useSessionEndHandlersProps {
  flow: SessionFlowRefs
  resetSessionState: () => void
  persistence: SessionPersistence
  socket: NonNullable<DashboardState['selectedDevice']>['socket'] | undefined
  activeExerciseData: DashboardState['activeExerciseData']
  setProgramState: DashboardHandler['setProgramState']
  updatePatientDashboardState: DashboardHandler['updatePatientDashboardState']
}

const useSessionEndHandlers = ({
  flow,
  resetSessionState,
  persistence,
  socket,
  activeExerciseData,
  setProgramState,
  updatePatientDashboardState,
}: useSessionEndHandlersProps) => {
  const { persistRemoteUpserts, interruptPatientSession } = persistence

  const clearedActiveExerciseData = {
    ...activeExerciseData,
    currentRep: 0,
    currentSet: 0,
    totalReps: 0,
    totalSets: 0,
  }

  const openCompletionDialog = async () => {
    const sessionIdForCompletion = flow.patientSessionIdRef.current

    if (
      sessionIdForCompletion &&
      flow.sessionExerciseRowsRef.current.length > 0
    ) {
      const result = completeSessionInFlow(flow.readFlowState())
      await persistRemoteUpserts(result.remoteUpserts)
      flow.writeFlowState(result.state)
    }

    resetSessionState()
    updatePatientDashboardState({
      programState: ProgramStatus.END,
      completionSessionId: sessionIdForCompletion || null,
      isDialogOpen: true,
      activeExerciseData: clearedActiveExerciseData,
    })
  }

  const handleEnd = async () => {
    socket?.emit(PROGRAM_EVENT.EndAck)
    await openCompletionDialog()
  }

  const handleEndAck = async () => {
    await openCompletionDialog()
  }

  const handleUnexpectedSessionEnd = async () => {
    const sessionId = flow.patientSessionIdRef.current

    if (!sessionId) {
      setProgramState(ProgramStatus.END)
      return
    }

    try {
      const result = interruptSessionInFlow(flow.readFlowState())
      await persistRemoteUpserts(result.remoteUpserts)
      flow.writeFlowState(result.state)
      await interruptPatientSession({ id: sessionId })
      notify.error({ key: 'toast.sessionInterrupted', ns: 'patient-dashboard' })
    } catch (error) {
      console.error(error)
      notify.error({
        key: 'toast.interruptedSaveFailed',
        ns: 'patient-dashboard',
      })
    } finally {
      flow.setConfirmedExerciseIndex(0)
      resetSessionState()
      updatePatientDashboardState({
        programState: ProgramStatus.END,
        completionSessionId: null,
        isDialogOpen: false,
        activeExerciseData: clearedActiveExerciseData,
      })
    }
  }

  return { handleEnd, handleEndAck, handleUnexpectedSessionEnd }
}

export default useSessionEndHandlers
