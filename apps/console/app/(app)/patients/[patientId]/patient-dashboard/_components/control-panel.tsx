import { useClientT } from '@/i18n/use-client-t'
import { cn, getDisplayName } from '@/lib/utils'
import ProgramSelector from './program-selector'
import SessionExerciseChangeStatus from './session-exercise-change-status'
import Controls from './control-panel-controls'
import ModeSelector from './control-panel-mode-selector'
import SceneSettings from './control-panel-scene-settings'
import DeviceSelector from './control-panel-device-selector'
import CastingButton from './control-panel-casting-button'
import useControlPanel from './use-control-panel'
import AutoLaunchStatus from './auto-launch-status'
import SessionRunningPanel from './session-running-panel'
import { type SessionRunningPhase } from './session-running-status'
import { useSessionWakeLock } from './use-session-wake-lock'
import { NavigationGuardDialog } from '@/components/dialogs/navigation-guard-dialog'
import { ImmersiveVideoPicker } from './immersive-video-picker'
import { ImmersiveVideoTransport } from './immersive-video-transport'
import { ImmersiveVideoStopAfterPicker } from './immersive-video-stop-after-picker'
import { useImmersiveVideoSession } from '@/context/immersive-video-session-context'

interface ControlPanelProps {
  className?: string
  showCasting: boolean
  setShowCasting: React.Dispatch<React.SetStateAction<boolean>>
}

const ControlPanel = ({
  className,
  showCasting,
  setShowCasting,
}: ControlPanelProps) => {
  const { t } = useClientT('patient-dashboard')
  const {
    coachEnabled,
    changeCoachEnabled,
    coachToggleDisabled,
    devices,
    connected,
    selectedMode,
    setSelectedMode,
    programState,
    isProgramInactive,
    treatmentLaunchReady,
    autoLaunchArmed,
    programStart,
    programEnd,
    handleWarmupStart,
    skipExercise,
    forwardSkipControl,
    backSkipControl,
    isMain,
    currentExerciseIndex,
    exerciseCount,
    activeExerciseData,
    pendingExerciseChange,
    exercises,
    defaultExercises,
    selectedDevice,
    missingSettings,
    guard,
  } = useControlPanel()
  const { playback, frozen } = useImmersiveVideoSession()
  const isImmersive = selectedMode === 'immersive'
  const sessionPhase: SessionRunningPhase | null =
    isMain && programState !== 'ready' ? programState : null

  useSessionWakeLock(!isProgramInactive)

  const exerciseName =
    getDisplayName(
      defaultExercises?.find(
        (exercise) => exercise.id === activeExerciseData.id,
      ),
    ) ?? null

  return (
    <>
      {/* Two groups that wrap as units: what to run (grows to fill its
          line) and the headset actions, with Start always last. */}
      <div
        className={cn(
          'bg-card flex flex-wrap items-center gap-2 rounded-xl border p-4 shadow',
          className,
        )}
      >
        <div className='flex min-w-0 flex-[1_1_20rem] flex-wrap items-center gap-2'>
          <ModeSelector
            selectedMode={selectedMode}
            setSelectedMode={setSelectedMode}
            programState={programState}
            playbackStatus={playback.state.status}
            frozen={frozen}
          />
          {isProgramInactive && isMain && (
            <ProgramSelector className='min-w-0 flex-[1_1_12rem]' />
          )}
          {isImmersive && (
            <ImmersiveVideoPicker className='min-w-0 flex-[1_1_12rem]' />
          )}
          {isImmersive && <ImmersiveVideoStopAfterPicker />}
        </div>

        <div className='ml-auto flex flex-wrap items-center justify-end gap-2 max-sm:w-full'>
          {autoLaunchArmed && <AutoLaunchStatus connected={connected} />}
          <DeviceSelector devices={devices} connected={connected} />
          <CastingButton
            showCasting={showCasting}
            setShowCasting={setShowCasting}
          />
          {isImmersive ? (
            <ImmersiveVideoTransport />
          ) : (
            <>
              <SceneSettings
                coachEnabled={coachEnabled}
                onCoachEnabledChange={changeCoachEnabled}
                coachToggleDisabled={coachToggleDisabled}
                selectedDevice={selectedDevice}
                missingSettings={missingSettings}
              />
              <Controls
                className='max-sm:w-full'
                selectedMode={selectedMode}
                isProgramInactive={isProgramInactive}
                treatmentLaunchReady={treatmentLaunchReady && !frozen}
                programStart={programStart}
                handleWarmupStart={handleWarmupStart}
              />
            </>
          )}
        </div>
      </div>

      {sessionPhase && (
        <SessionRunningPanel
          phase={sessionPhase}
          exerciseName={exerciseName}
          exerciseNumber={currentExerciseIndex + 1}
          exerciseCount={exerciseCount}
          currentSet={activeExerciseData.currentSet}
          totalSets={activeExerciseData.totalSets}
          currentRep={activeExerciseData.currentRep}
          totalReps={activeExerciseData.totalReps}
          changeStatus={
            pendingExerciseChange ? (
              <SessionExerciseChangeStatus
                pendingExerciseChange={pendingExerciseChange}
                exercises={exercises}
                defaultExercises={defaultExercises}
              />
            ) : null
          }
          onPauseToggle={programStart}
          onEnd={programEnd}
          onSkip={skipExercise}
          isBackSkipDisabled={backSkipControl.isDisabled}
          isForwardSkipDisabled={forwardSkipControl.isDisabled}
          backSkipTooltip={backSkipControl.tooltip}
          forwardSkipTooltip={forwardSkipControl.tooltip}
        />
      )}

      <NavigationGuardDialog
        {...guard}
        title={t('navigationGuard.title')}
        description={t('navigationGuard.description')}
      />
    </>
  )
}

export default ControlPanel
