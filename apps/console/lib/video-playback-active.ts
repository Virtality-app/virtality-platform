import type { ImmersivePlaybackStatus } from '@/lib/immersive-video-playback-reducer'

export const VIDEO_ACTIVE_WINDOW_MS = 3_000

export function isVideoPlaybackActive(input: {
  status: ImmersivePlaybackStatus
  lastProgressAt: number | null
  now: number
}): boolean {
  if (input.status === 'Starting') return true
  if (input.lastProgressAt == null) return false
  return input.now - input.lastProgressAt <= VIDEO_ACTIVE_WINDOW_MS
}
