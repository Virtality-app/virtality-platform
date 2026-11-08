import { useEffect } from 'react'
import { usePatientDashboard } from '@/context/patient-dashboard-context'
import { notify } from '@/lib/notify'
// import { getClientT } from '@/i18n/get-client-t';
import useSocketConnection from '@/hooks/use-socket-connection'
import { useDeviceContext } from '@/context/device-context'
import { useRow, useStore, useValue } from 'tinybase/ui-react'
import { PatientLocalData } from '@/types/models'
import { type ProgramStartPayload } from '@virtality/shared/types'
import useNavigationGuard from '@/hooks/use-navigation-guard'
import {
  useExercise,
  usePatient,
  usePatientSessions,
} from '@virtality/react-query'
import { resolveSavedHeadsetSelection } from '@/lib/patient-dashboard-device-selection'
import {
  canLaunchTreatment,
  getTreatmentLaunchError,
  resolveTreatmentLaunchBlock,
  type TreatmentLaunchBlock,
} from '@/lib/patient-dashboard-treatment-launch'
import { trackAnalyticsEvent } from '@/lib/analytics-contract'
import type {
  LaunchBlockedReason,
  LaunchEntry,
  ProgramSource,
} from '@virtality/analytics'
import type { DashboardMode } from '@/types/models'
import { useVrHeadsetPresence } from '@/hooks/use-vr-headset-presence'
import { useLiveEntitlementStanding } from '@/hooks/use-live-entitlement-standing'
import {
  resolveCurrentExerciseIndex,
  type SkipDirection,
} from '@/lib/session-exercise-skip'
import { resolveSkipControlUiState } from '@/lib/session-exercise-change-ui'
import useCoachSettings from './use-coach-settings'
import { useLaunchIntentFromUrl } from './use-launch-intent-from-url'

const LAUNCH_BLOCK_REASON: Record<TreatmentLaunchBlock, LaunchBlockedReason> = {
  entitlementPending: 'entitlement_pending',
  entitlementExpired: 'entitlement_expired',
  consoleDisconnected: 'console_disconnected',
  headsetAbsent: 'headset_absent',
}

const useControlPanel = () => {
  const { devices } = useDeviceContext()
  const { state, handler, patientId, currExercise, requestForwardBackSkip } =
    usePatientDashboard()
  const { data: patientSessions } = usePatientSessions({
    input: { where: { patientId } },
  })
  const { data: patient } = usePatient({ patientId })
  const { data: defaultExercises } = useExercise()
  const sessionNumber = patientSessions?.length ?? 0
  const {
    programState,
    selectedMap,
    selectedMode,
    selectedDevice,
    selectedAvatar,
    exercises,
    activeExerciseData,
    pendingExerciseChange,
    inQuickStart,
  } = state

  const {
    setSelectedMode,
    setSelectedDevice,
    setActiveExerciseData,
    setProgramState,
    setInQuickStart,
  } = handler
  // const { t } = getClientT(['patient-dashboard', 'common']);

  const { connected, connect } = useSocketConnection({
    device: selectedDevice,
  })
  const headsetPresent = useVrHeadsetPresence(selectedDevice)
  const { coachEnabled, changeCoachEnabled, coachToggleDisabled } =
    useCoachSettings({
      patientId,
      programState,
      selectedMode,
      selectedDevice,
      headsetReady: connected && headsetPresent,
    })
  const { canLaunchVr, isPending: entitlementPending } =
    useLiveEntitlementStanding()
  const launchReadiness = {
    consoleConnected: connected,
    headsetPresent,
    entitlementAllowsLaunch: canLaunchVr,
    entitlementPending,
  }
  const treatmentLaunchReady = canLaunchTreatment(launchReadiness)

  const missingSettings = !selectedAvatar || !selectedMap

  const patientLocalData = useRow('patients', patientId) as PatientLocalData
  const lastPairedDeviceId = useValue('lastPairedDeviceId') as
    | string
    | undefined
  const store = useStore()

  useEffect(() => {
    const { selectedDevice: restoredDevice, shouldClearSavedHeadset } =
      resolveSavedHeadsetSelection(
        devices,
        patientLocalData?.lastHeadset ?? lastPairedDeviceId,
      )

    if (shouldClearSavedHeadset) {
      store?.delCell('patients', patientId, 'lastHeadset')
    }

    if (selectedDevice?.data.id !== restoredDevice?.data.id) {
      setSelectedDevice(restoredDevice)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devices, patientLocalData, lastPairedDeviceId, selectedDevice])

  const programSource: ProgramSource = inQuickStart
    ? 'quick_start'
    : 'reusable_program'

  const trackLaunchBlocked = (reason: LaunchBlockedReason) =>
    trackAnalyticsEvent('session_launch_blocked', {
      reason,
      program_source: programSource,
    })

  const startProgram = (entry: LaunchEntry) => {
    if (!exercises?.length) {
      trackLaunchBlocked('no_exercises')
      return notify.error({
        key: 'toast.selectProgram',
        ns: 'patient-dashboard',
      })
    }

    const launchBlock = resolveTreatmentLaunchBlock(launchReadiness)
    if (launchBlock) {
      trackLaunchBlocked(LAUNCH_BLOCK_REASON[launchBlock])
      return notify.error(getTreatmentLaunchError(launchReadiness)!)
    }

    if (!state.selectedAvatar || !state.selectedMap) {
      trackLaunchBlocked('missing_scene_settings')
      return notify.error({
        key: 'toast.selectAvatarAndMap',
        ns: 'patient-dashboard',
      })
    }

    if (state.programState === 'ready') {
      const dispatchedData = exercises.map((ex) => {
        const newEx = {
          id: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          restTime: ex.restTime,
          holdTime: ex.holdTime,
          speed: ex.speed,
          romMode: ex.romMode,
        }
        return newEx
      })

      const payload: ProgramStartPayload = {
        exerciseData: dispatchedData,
        settings: {
          avatarId: selectedAvatar?.id ?? '',
          mapId: selectedMap?.id ?? '',
          sessionNumber,
          language: patient?.language,
          coachEnabled,
        },
      }

      setActiveExerciseData({
        id: exercises[0].exerciseId,
        currentRep: 0,
        currentSet: 1,
        totalReps: dispatchedData[0].reps,
        totalSets: dispatchedData[0].sets,
      })

      setProgramState('launching')
      selectedDevice?.events.program.Start(payload)
      trackAnalyticsEvent('session_launch_attempted', {
        mode: selectedMode,
        program_source: programSource,
        exercise_count: exercises.length,
        entry,
      })
    } else {
      selectedDevice?.events.program.Pause()
      if (state.programState === 'started') {
        trackAnalyticsEvent('session_paused', { program_source: programSource })
      } else if (state.programState === 'paused') {
        trackAnalyticsEvent('session_resumed', {
          program_source: programSource,
        })
      }
    }
  }

  const programStart = () => startProgram('manual')

  const programEnd = () => {
    selectedDevice?.events.program.End()
  }

  const { autoLaunchArmed } = useLaunchIntentFromUrl({
    gate: {
      selectedMode,
      inQuickStart,
      exerciseCount: exercises?.length ?? 0,
      treatmentLaunchReady,
      missingSettings,
      programState,
    },
    selectedDevice,
    consoleConnected: connected,
    launchError: getTreatmentLaunchError(launchReadiness),
    connect,
    programStart: () => startProgram('launch_intent'),
    setInQuickStart,
    setSelectedMode,
  })

  const skipExercise = (direction: SkipDirection) => {
    trackAnalyticsEvent('exercise_skipped', { direction })
    void requestForwardBackSkip(direction)
  }

  const handleWarmupStart = () => {
    if (missingSettings)
      return notify.error({
        key: 'toast.selectAvatarAndMap',
        ns: 'patient-dashboard',
      })

    const launchError = getTreatmentLaunchError({
      consoleConnected: connected,
      headsetPresent,
      entitlementAllowsLaunch: canLaunchVr,
      entitlementPending,
    })
    if (launchError) return notify.error(launchError)

    const payload = {
      settings: {
        avatarId: selectedAvatar!.id,
        sessionNumber,
        mapId: selectedMap!.id,
      },
    }
    if (programState !== 'started') {
      selectedDevice?.events.program.WarmupStart(payload)
      trackAnalyticsEvent('warmup_started', {})
    } else selectedDevice?.events.program.WarmupEnd()
  }

  const isProgramActive = programState === 'started'
  const isProgramInactive = programState === 'ready'
  const isProgramPaused = programState === 'paused'
  const isProgramLaunching = programState === 'launching'
  const isMain = selectedMode === 'main'
  const currentExerciseIndex = resolveCurrentExerciseIndex({
    exercises,
    activeExerciseId: activeExerciseData.id,
    fallbackIndex: currExercise.current,
  })
  const exerciseCount = exercises?.length ?? 0
  const skipControlState = {
    currentExerciseIndex,
    exerciseCount,
    pendingExerciseChange,
  }
  const forwardSkipControl = resolveSkipControlUiState({
    ...skipControlState,
    direction: 'forward',
  })
  const backSkipControl = resolveSkipControlUiState({
    ...skipControlState,
    direction: 'back',
  })
  const isSkipBlockedByProgramState =
    isProgramInactive || isProgramPaused || isProgramLaunching

  const { guard } = useNavigationGuard(connected, () => {
    selectedDevice?.socket.disconnect()
  })

  const toggleCoach = (enabled: boolean) => {
    changeCoachEnabled(enabled)
    trackAnalyticsEvent('coach_toggled', { enabled })
  }

  const selectMode = (mode: DashboardMode) => {
    setSelectedMode(mode)
    trackAnalyticsEvent('dashboard_mode_selected', { mode })
  }

  return {
    coachEnabled,
    changeCoachEnabled: toggleCoach,
    coachToggleDisabled,
    devices,
    connected,
    selectedMode,
    setSelectedMode: selectMode,
    programState,
    isProgramPaused,
    isProgramInactive,
    isProgramActive,
    isProgramLaunching,
    treatmentLaunchReady,
    autoLaunchArmed,
    programStart,
    programEnd,
    handleWarmupStart,
    skipExercise,
    forwardSkipControl,
    backSkipControl,
    isSkipBlockedByProgramState,
    isMain,
    activeExerciseData,
    pendingExerciseChange,
    exercises,
    defaultExercises,
    selectedDevice,
    missingSettings,
    guard,
  }
}

export default useControlPanel
