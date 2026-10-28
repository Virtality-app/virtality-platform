import { PatientLocalData, ProgramStatus } from '@/types/models'
import { subscribe } from '@/lib/device-event-controller'
import {
  PROGRAM_EVENT,
  ROOM_EVENT,
  SYSTEM_EVENT,
} from '@virtality/shared/types'
import { RefObject, useEffect } from 'react'
import { Store } from 'tinybase'
import { notify } from '@/lib/notify'
import usePlotData from '@/hooks/use-plot-data'
import useSessionFlowRefs from './use-session-flow-refs'
import usePendingExerciseChange from './use-pending-exercise-change'
import useSessionPlot from './use-session-plot'
import useSessionPersistence from './use-session-persistence'
import useSessionWorkingCopySync from './use-session-working-copy-sync'
import useExerciseSkipRequest from './use-exercise-skip-request'
import useSessionStartAck from './use-session-start-ack'
import useExerciseProgressHandlers from './use-exercise-progress-handlers'
import useSessionEndHandlers from './use-session-end-handlers'
import type { DashboardHandler, DashboardState } from './types'

interface usePatientDashboardSocketSetupProps {
  state: DashboardState
  handler: DashboardHandler
  patientId: string
  store?: Store
  currExercise: RefObject<number>
  patientLocalData: PatientLocalData
  plot: ReturnType<typeof usePlotData>
}

// The only adapter between the headset socket and `skip-safe-progress-flow`.
// The hooks in this folder each own one part of a live session; this one wires
// them to the socket events.
const usePatientDashboardSocketSetup = ({
  state,
  handler,
  patientId,
  store,
  currExercise,
  plot,
}: usePatientDashboardSocketSetupProps) => {
  const { programState, exercises, selectedDevice, activeExerciseData } = state
  const {
    setProgramState,
    setActiveExerciseData,
    updatePatientDashboardState,
  } = handler
  const socket = selectedDevice?.socket

  const flow = useSessionFlowRefs(currExercise)
  const pendingChange = usePendingExerciseChange({
    flow,
    exercises,
    updatePatientDashboardState,
  })
  const sessionPlot = useSessionPlot({ flow, exercises, plot })
  const persistence = useSessionPersistence(patientId)

  const resetSessionState = () => {
    flow.resetSessionRefs()
    pendingChange.clearPendingExerciseChange()
  }

  const { requestForwardBackSkip, requestDirectExerciseSelection } =
    useExerciseSkipRequest({
      flow,
      pendingChange,
      persistRemoteUpserts: persistence.persistRemoteUpserts,
      programState,
      exercises,
      selectedDevice,
    })

  const { handleStartAck } = useSessionStartAck({
    state,
    setProgramState,
    patientId,
    flow,
    resetSessionState,
    progressDataClear: sessionPlot.progressDataClear,
    startPatientSessionFromAck: persistence.startPatientSessionFromAck,
  })

  const {
    handleChangeExercise,
    handleChangeExerciseAck,
    handleRepEnd,
    handleSetEnd,
  } = useExerciseProgressHandlers({
    flow,
    pendingChange,
    sessionPlot,
    persistRemoteUpserts: persistence.persistRemoteUpserts,
    exercises,
    activeExerciseData,
    setActiveExerciseData,
    patientId,
    store,
  })

  const { handleEnd, handleEndAck, handleUnexpectedSessionEnd } =
    useSessionEndHandlers({
      flow,
      resetSessionState,
      persistence,
      socket,
      activeExerciseData,
      setProgramState,
      updatePatientDashboardState,
    })

  const handlePauseAck = () => {
    if (programState === 'started') {
      setProgramState(ProgramStatus.PAUSE)
    } else {
      setProgramState(ProgramStatus.START)
    }
  }

  const handleWarmupStartAck = () => {
    setProgramState(ProgramStatus.START)
  }

  const handleWarmupEndAck = () => {
    setProgramState(ProgramStatus.END)
  }

  const handleCalibrateHeightAck = () => {
    notify.success('Height calibrated successfully.')
  }

  const handleResetPositionAck = () => {
    notify.success('Position reset successfully.')
  }

  const handleSettingsChangeAck = () => {
    notify.success('Settings changed successfully.')
  }

  const handleNotifyDoctor = () => {
    notify.attention('Patient needs attention')
  }

  const memberLeft = async () => {
    await handleUnexpectedSessionEnd()
  }

  useSessionWorkingCopySync({ flow, programState, exercises })

  useEffect(() => {
    if (!socket) return

    return subscribe(
      socket,
      { ...PROGRAM_EVENT, ...ROOM_EVENT, ...SYSTEM_EVENT },
      {
        // PROGRAM_EVENT
        StartAck: handleStartAck,
        PauseAck: handlePauseAck,
        End: handleEnd,
        EndAck: handleEndAck,
        ChangeExercise: handleChangeExercise,
        ChangeExerciseAck: handleChangeExerciseAck,
        RepEnd: handleRepEnd,
        SetEnd: handleSetEnd,
        WarmupStartAck: handleWarmupStartAck,
        WarmupEndAck: handleWarmupEndAck,
        CalibrateHeightAck: handleCalibrateHeightAck,
        ResetPositionAck: handleResetPositionAck,
        SettingsChangeAck: handleSettingsChangeAck,

        // ROOM_EVENT
        MemberLeft: memberLeft,

        // SYSTEM_EVENT
        NotifyDoctor: handleNotifyDoctor,
      },
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, socket])

  return {
    patientSessionId: flow.patientSessionIdRef,
    requestForwardBackSkip,
    requestDirectExerciseSelection,
  }
}

export default usePatientDashboardSocketSetup
