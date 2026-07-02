import {
  PatientLocalData,
  ProgramStatus,
  ProgressDataPoint,
} from '@/types/models'
import { subscribe } from '@/lib/device-event-controller'
import {
  PROGRAM_EVENT,
  ROOM_EVENT,
  SYSTEM_EVENT,
} from '@virtality/shared/types'
import { RefObject, useEffect, useRef } from 'react'
import { Store } from 'tinybase'
import useDashboardState from './use-patient-dashboard-state'
import SuccessToasty from '../components/ui/SuccessToasty'
import NotifyDoctorToasty from '../components/ui/NotifyDoctorToasty'
import { getDisplayName } from '@/lib/utils'
import usePlotData from './use-plot-data'
import {
  applyCompletedRepToPlotData,
  normalizeRepEndPayload,
  normalizeSetEndPayload,
} from '@/lib/progress-event-normalization'
import {
  buildExerciseSkipCheckpoint,
  buildSetCompletionCheckpoint,
  mutableProgressByExerciseId,
} from '@/lib/session-progress-checkpoint'
import {
  resolveForwardBackSkipTarget,
  shouldIgnoreProgressEventDuringPendingExerciseChange,
  type PendingExerciseChange,
  type SkipDirection,
} from '@/lib/session-exercise-skip'
import {
  getQueryClient,
  useStartPatientSessionFromAck,
  useUpsertPatientSessionData,
  useInterruptPatientSession,
  useSyncSessionWorkingCopy,
  useORPC,
} from '@virtality/react-query'
import {
  buildStartAckPersistenceInput,
  canPersistSessionProgress,
  resolveProgramStateAfterStartAckPersistenceFailure,
  resolveProgramStateAfterStartAckPersistenceSuccess,
  shouldCreatePatientSessionOnStartAck,
  type SessionExerciseRowInput,
} from '@/lib/patient-dashboard-session-launch'
import { buildSessionProgressUpserts } from '@/lib/session-progress-persistence'
import {
  buildSessionWorkingCopySyncPayload,
  serializeSessionWorkingCopy,
  shouldPersistSessionWorkingCopy,
} from '@/lib/session-working-copy-sync'
import { generateUUID } from '@virtality/shared/utils'
import ErrorToasty from '../components/ui/ErrorToasty'

type ProgressDataPerExercise = {
  [key: string]: ProgressDataPoint[]
}

interface usePatientDashboardSocketSetupProps {
  state: ReturnType<typeof useDashboardState>['state']
  handler: ReturnType<typeof useDashboardState>['handler']
  patientId: string
  store?: Store
  currExercise: RefObject<number>
  patientLocalData: PatientLocalData
  plot: ReturnType<typeof usePlotData>
}

const usePatientDashboardSocketSetup = ({
  state,
  handler,
  patientId,
  store,
  currExercise,
  plot,
}: usePatientDashboardSocketSetupProps) => {
  const queryClient = getQueryClient()
  const orpc = useORPC()

  const {
    selectedProgram,
    programState,
    isDialogOpen,
    exercises,
    selectedDevice,
    activeExerciseData,
    inQuickStart,
  } = state

  const {
    setProgramState,
    setActiveExerciseData,
    updatePatientDashboardState,
  } = handler

  const { setPlotData } = plot.handler
  const socket = selectedDevice?.socket
  const progressData = useRef<ProgressDataPerExercise | null>(null)
  const realTimeData = useRef<ProgressDataPoint[]>([])
  const patientSessionId = useRef('')
  const sessionExerciseRows = useRef<SessionExerciseRowInput[]>([])
  const lastSyncedWorkingCopy = useRef<string | null>(null)
  const currSet = useRef(0)
  const currRep = useRef(0)
  const stats = useRef({ highscore: 0, bestExercise: '' })
  const pendingExerciseChange = useRef<PendingExerciseChange | null>(null)

  const invalidatePatientSessions = async () =>
    await queryClient.invalidateQueries({
      queryKey: orpc.patientSession.list.queryKey({
        input: { where: { patientId } },
      }),
    })

  const { mutateAsync: upsertPatientSessionData } = useUpsertPatientSessionData(
    {
      onSuccess: invalidatePatientSessions,
    },
  )

  const { mutateAsync: startPatientSessionFromAck } =
    useStartPatientSessionFromAck({
      onSuccess: invalidatePatientSessions,
    })

  const { mutateAsync: interruptPatientSession } = useInterruptPatientSession({
    onSuccess: invalidatePatientSessions,
  })

  const { mutateAsync: syncSessionWorkingCopy } = useSyncSessionWorkingCopy()

  const resetSessionState = () => {
    patientSessionId.current = ''
    sessionExerciseRows.current = []
    lastSyncedWorkingCopy.current = null
    clearPendingExerciseChange()
  }

  const clearPendingExerciseChange = () => {
    pendingExerciseChange.current = null
    updatePatientDashboardState({ pendingExerciseChange: null })
  }

  const setPendingExerciseChange = (change: PendingExerciseChange) => {
    pendingExerciseChange.current = change
    updatePatientDashboardState({ pendingExerciseChange: change })
  }

  const applyExerciseAtIndex = (index: number) => {
    const exercise = exercises?.[index]

    if (!exercise) {
      return
    }

    currExercise.current = index
    setActiveExerciseData({
      id: exercise.exerciseId,
      currentRep: 0,
      currentSet: 1,
      totalReps: exercise.reps,
      totalSets: exercise.sets,
    })
  }

  const handleSessionDataCreation = async () => {
    if (!patientSessionId.current || sessionExerciseRows.current.length === 0) {
      return
    }

    await upsertPatientSessionData(
      buildSessionProgressUpserts({
        patientSessionId: patientSessionId.current,
        sessionExerciseRows: sessionExerciseRows.current,
        progressByExerciseId: progressData.current ?? {},
        currentExerciseIndex: currExercise.current,
        currentExerciseProgress: realTimeData.current,
      }),
    )
  }

  const progressDataClear = () => {
    currSet.current = 0
    currRep.current = 0
    const reps = exercises?.[currExercise.current]?.reps ?? 0
    realTimeData.current = Array.from({ length: reps }, (_, i) => ({
      rep: i + 1,
    }))
    setPlotData(realTimeData.current)
  }

  const shouldIgnoreProgressEvent = () => {
    const currentExercise = exercises?.[currExercise.current]

    if (!currentExercise) {
      return false
    }

    return shouldIgnoreProgressEventDuringPendingExerciseChange({
      pendingExerciseChange: pendingExerciseChange.current,
      eventExerciseIndex: currExercise.current,
      eventExerciseId: currentExercise.exerciseId,
    })
  }

  const requestForwardBackSkip = async (direction: SkipDirection) => {
    if (
      programState !== 'started' ||
      !exercises?.length ||
      pendingExerciseChange.current !== null
    ) {
      return
    }

    const targetIndex = resolveForwardBackSkipTarget({
      currentExerciseIndex: currExercise.current,
      exerciseCount: exercises.length,
      direction,
    })

    if (targetIndex === null) {
      return
    }

    const sourceIndex = currExercise.current
    const sourceExercise = exercises[sourceIndex]

    if (!sourceExercise) {
      return
    }

    setPendingExerciseChange({
      targetExerciseIndex: targetIndex,
      sourceExerciseIndex: sourceIndex,
      sourceExerciseId: sourceExercise.exerciseId,
    })

    if (
      canPersistSessionProgress(
        patientSessionId.current,
        sessionExerciseRows.current,
        sourceIndex,
      )
    ) {
      const checkpoint = buildExerciseSkipCheckpoint({
        patientSessionId: patientSessionId.current,
        sessionExerciseRows: sessionExerciseRows.current,
        currentExerciseIndex: sourceIndex,
        progressByExerciseId: progressData.current ?? {},
        currentExerciseProgress: realTimeData.current,
      })

      if (checkpoint.upsert) {
        try {
          await upsertPatientSessionData([checkpoint.upsert])
        } catch (error) {
          console.error(error)
        }
      }

      progressData.current = mutableProgressByExerciseId(
        checkpoint.progressByExerciseId,
      )
    }

    selectedDevice?.events.program.ChangeExercise(
      exercises[targetIndex].exerciseId,
    )
  }

  const handlePersistenceFailureAfterStartAck = () => {
    resetSessionState()
    socket?.emit(PROGRAM_EVENT.End)
    selectedDevice?.events.program.End()
    ErrorToasty('Failed to start session. Please try again.')
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
      })

      patientSessionId.current = persistenceInput.sessionId
      sessionExerciseRows.current = persistenceInput.exercises
      lastSyncedWorkingCopy.current = serializeSessionWorkingCopy(exercises)
      setProgramState(resolveProgramStateAfterStartAckPersistenceSuccess())
    } catch (error) {
      console.error(error)
      handlePersistenceFailureAfterStartAck()
    }
  }

  const handlePauseAck = () => {
    if (programState === 'started') {
      setProgramState(ProgramStatus.PAUSE)
    } else {
      setProgramState(ProgramStatus.START)
    }
  }

  const openCompletionDialog = async () => {
    const sessionIdForCompletion = patientSessionId.current

    await handleSessionDataCreation()

    resetSessionState()
    updatePatientDashboardState({
      programState: ProgramStatus.END,
      completionSessionId: sessionIdForCompletion || null,
      isDialogOpen: true,
      activeExerciseData: {
        ...activeExerciseData,
        currentRep: 0,
        currentSet: 0,
        totalReps: 0,
        totalSets: 0,
      },
    })
  }

  const handleEnd = async () => {
    socket?.emit(PROGRAM_EVENT.EndAck)
    currExercise.current = 0
    await openCompletionDialog()
  }

  const handleEndAck = async () => {
    currExercise.current = 0
    await openCompletionDialog()
  }

  const handleChangeExercise = (data: string) => {
    const nextExercise = exercises?.findIndex((ex) => ex.exerciseId === data)

    if (nextExercise === undefined) {
      throw Error('Error getting next exercise')
    }
    const index = nextExercise + 1

    setActiveExerciseData({
      id: exercises[index].exerciseId,
      currentRep: 0,
      currentSet: 1,
      totalReps: exercises[index].reps,
      totalSets: exercises[index].sets,
    })

    currExercise.current = index
    progressDataClear()
  }

  const handleChangeExerciseAck = () => {
    if (pendingExerciseChange.current) {
      applyExerciseAtIndex(pendingExerciseChange.current.targetExerciseIndex)
      clearPendingExerciseChange()
    }

    progressDataClear()
  }

  const handleRepEnd = (payload: string) => {
    if (
      !canPersistSessionProgress(
        patientSessionId.current,
        sessionExerciseRows.current,
        currExercise.current,
      )
    ) {
      return
    }

    if (shouldIgnoreProgressEvent()) {
      return
    }

    const normalized = normalizeRepEndPayload(payload)

    if (!normalized.ok) {
      console.log('Ignoring malformed RepEnd payload')
      return
    }

    const { completedRep, progress } = normalized.event
    const currentExercise = exercises![currExercise.current]

    if (stats.current.highscore < progress) {
      stats.current.highscore = progress
      stats.current.bestExercise =
        getDisplayName(currentExercise.exercise) ?? ''
    }

    const activeSet = currSet.current + 1
    const updatedPlotData = applyCompletedRepToPlotData(realTimeData.current, {
      completedRep,
      activeSet,
      progressPercent: progress * 100,
    })

    currRep.current = completedRep - 1
    realTimeData.current = updatedPlotData

    setPlotData(updatedPlotData)
    setActiveExerciseData({ ...activeExerciseData, currentRep: completedRep })
    const prevData = progressData.current
    store?.setCell(
      'patients',
      patientId,
      'progress',
      JSON.stringify({
        ...prevData,
        [currentExercise.exerciseId]: updatedPlotData,
      }),
    )

    store?.setCell('patients', patientId, 'highscore', stats.current.highscore)
    store?.setCell(
      'patients',
      patientId,
      'bestExercise',
      stats.current.bestExercise,
    )
  }

  const handleSetEnd = async (payload: string) => {
    if (
      !canPersistSessionProgress(
        patientSessionId.current,
        sessionExerciseRows.current,
        currExercise.current,
      )
    ) {
      return
    }

    if (shouldIgnoreProgressEvent()) {
      return
    }

    const normalized = normalizeSetEndPayload(payload)

    if (!normalized.ok) {
      console.log('Ignoring malformed SetEnd payload')
      return
    }

    const { completedSet } = normalized.event
    const currentExerciseIndex = currExercise.current

    currSet.current = completedSet

    setActiveExerciseData({
      ...activeExerciseData,
      currentSet: completedSet + 1,
    })

    const checkpoint = buildSetCompletionCheckpoint({
      patientSessionId: patientSessionId.current,
      sessionExerciseRows: sessionExerciseRows.current,
      currentExerciseIndex,
      progressByExerciseId: progressData.current ?? {},
      currentExerciseProgress: realTimeData.current,
      completedSet,
      lastCompletedRepIndex: currRep.current,
      isLastExercise: currentExerciseIndex === exercises!.length - 1,
    })

    try {
      await upsertPatientSessionData([checkpoint.upsert])
      progressData.current = mutableProgressByExerciseId(
        checkpoint.progressByExerciseId,
      )
      currExercise.current = checkpoint.nextCurrentExerciseIndex
    } catch (error) {
      console.error(error)
    }
  }

  const handleWarmupStartAck = () => {
    setProgramState(ProgramStatus.START)
  }

  const handleWarmupEndAck = () => {
    setProgramState(ProgramStatus.END)
  }

  const handleCalibrateHeightAck = () => {
    SuccessToasty('Height calibrated successfully.')
  }

  const handleResetPositionAck = () => {
    SuccessToasty('Position reset successfully.')
  }

  const handleSettingsChangeAck = () => {
    SuccessToasty('Settings changed successfully.')
  }

  const handleNotifyDoctor = () => {
    NotifyDoctorToasty('Patient needs attention')
  }

  const handleUnexpectedSessionEnd = async () => {
    const sessionId = patientSessionId.current

    if (!sessionId) {
      setProgramState(ProgramStatus.END)
      return
    }

    try {
      await handleSessionDataCreation()
      await interruptPatientSession({ id: sessionId })
      ErrorToasty('Session was interrupted before completion.')
    } catch (error) {
      console.error(error)
      ErrorToasty('Failed to save interrupted session progress.')
    } finally {
      currExercise.current = 0
      resetSessionState()
      updatePatientDashboardState({
        programState: ProgramStatus.END,
        completionSessionId: null,
        isDialogOpen: false,
        activeExerciseData: {
          ...activeExerciseData,
          currentRep: 0,
          currentSet: 0,
          totalReps: 0,
          totalSets: 0,
        },
      })
    }
  }

  const memberLeft = async () => {
    await handleUnexpectedSessionEnd()
  }

  useEffect(() => {
    if (
      !shouldPersistSessionWorkingCopy(
        programState,
        patientSessionId.current,
        exercises,
      )
    ) {
      return
    }

    const serializedWorkingCopy = serializeSessionWorkingCopy(exercises)
    if (serializedWorkingCopy === lastSyncedWorkingCopy.current) {
      return
    }

    const payload = buildSessionWorkingCopySyncPayload({
      sessionId: patientSessionId.current,
      exercises,
      persistedRows: sessionExerciseRows.current,
      createId: generateUUID,
    })

    void syncSessionWorkingCopy(payload)
      .then((result) => {
        sessionExerciseRows.current = result.exercises.map((exercise) => ({
          ...exercise,
          patientSessionId: patientSessionId.current,
        }))
        lastSyncedWorkingCopy.current = serializedWorkingCopy
      })
      .catch((error) => {
        console.error(error)
      })
  }, [exercises, programState, syncSessionWorkingCopy])

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
    patientSessionId,
    requestForwardBackSkip,
  }
}

export default usePatientDashboardSocketSetup
