import { PROGRAM_EVENT } from '@virtality/shared/types'
import { notify } from '@/lib/notify'
import {
  buildStartAckPersistenceInput,
  resolveProgramStateAfterStartAckPersistenceFailure,
  resolveProgramStateAfterStartAckPersistenceSuccess,
  shouldCreatePatientSessionOnStartAck,
} from '@/lib/patient-dashboard-session-launch'
import { serializeSessionWorkingCopy } from '@/lib/session-working-copy-sync'
import type { SessionFlowRefs } from './use-session-flow-refs'
import type { SessionPersistence } from './use-session-persistence'
import type { DashboardHandler, DashboardState } from './types'

interface useSessionStartAckProps {
  state: DashboardState
  setProgramState: DashboardHandler['setProgramState']
  patientId: string
  flow: SessionFlowRefs
  resetSessionState: () => void
  progressDataClear: () => void
  startPatientSessionFromAck: SessionPersistence['startPatientSessionFromAck']
}

const useSessionStartAck = ({
  state,
  setProgramState,
  patientId,
  flow,
  resetSessionState,
  progressDataClear,
  startPatientSessionFromAck,
}: useSessionStartAckProps) => {
  const {
    selectedProgram,
    programState,
    exercises,
    selectedDevice,
    inQuickStart,
  } = state
  const socket = selectedDevice?.socket

  const handlePersistenceFailureAfterStartAck = () => {
    resetSessionState()
    socket?.emit(PROGRAM_EVENT.End)
    selectedDevice?.events.program.End()
    notify.error('Failed to start session. Please try again.')
    setProgramState(resolveProgramStateAfterStartAckPersistenceFailure())
  }

  const handleStartAck = async () => {
    if (!shouldCreatePatientSessionOnStartAck(programState)) {
      return
    }

    const persistenceInput = buildStartAckPersistenceInput({
      programState,
      exercises,
      patientId,
      inQuickStart,
      selectedProgram,
    })

    if (!persistenceInput) {
      handlePersistenceFailureAfterStartAck()
      return
    }

    progressDataClear()

    try {
      await startPatientSessionFromAck({
        session: persistenceInput.session,
        exercises: persistenceInput.exercises,
        roomCode: socket?.io.opts.query.roomCode,
      })

      flow.recordStartedSession(
        persistenceInput.sessionId,
        persistenceInput.exercises,
        serializeSessionWorkingCopy(exercises),
      )
      setProgramState(resolveProgramStateAfterStartAckPersistenceSuccess())
    } catch (error) {
      console.error(error)
      handlePersistenceFailureAfterStartAck()
    }
  }

  return { handleStartAck }
}

export default useSessionStartAck
