import type { PatientDashboardValue } from '@/context/patient-dashboard-context'
import {
  isImmersivePlaybackBlocking,
  type ImmersivePlaybackStatus,
} from '@/lib/immersive-video-playback-reducer'

export type DashboardProgramState =
  PatientDashboardValue['state']['programState']

export type DashboardSelectedMode =
  PatientDashboardValue['state']['selectedMode']

export const LEAVE_IMMERSIVE_MODE_HINT = 'Stop the video to change mode.'

export function isDashboardMode(value: string): value is DashboardSelectedMode {
  return value === 'main' || value === 'free' || value === 'immersive'
}

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
  return isImmersivePlaybackBlocking(playbackStatus)
}
