import {
  VIDEO_ACTIVE_WINDOW_MS,
  type ImmersivePlaybackStatus,
} from './immersive-video-playback-reducer'

export { VIDEO_ACTIVE_WINDOW_MS }

export function isVideoPlaybackActive(input: {
  status: ImmersivePlaybackStatus
  lastProgressAt: number | null
  now: number
}): boolean {
  if (input.status === 'Starting') return true
  if (input.lastProgressAt == null) return false
  return input.now - input.lastProgressAt <= VIDEO_ACTIVE_WINDOW_MS
}
