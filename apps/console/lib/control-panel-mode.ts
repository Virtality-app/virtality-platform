import type { PatientDashboardValue } from '@/context/patient-dashboard-context'
import type { ImmersivePlaybackStatus } from '@/lib/immersive-video-playback-reducer'

export type DashboardProgramState =
  PatientDashboardValue['state']['programState']

export function isProgramModeSwitchLocked(
  programState: DashboardProgramState,
): boolean {
  return (
    programState === 'started' ||
    programState === 'paused' ||
    programState === 'launching'
  )
}

export function canEnterImmersiveMode(
  programState: DashboardProgramState,
): boolean {
  return programState === 'ready'
}

export function isLeavingImmersiveLocked(
  playbackStatus: ImmersivePlaybackStatus,
): boolean {
  return (
    playbackStatus === 'Starting' ||
    playbackStatus === 'Playing' ||
    playbackStatus === 'Paused'
  )
}
