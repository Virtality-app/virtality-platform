import { describe, expect, it } from 'vitest'
import {
  isVideoPlaybackActive,
  VIDEO_ACTIVE_WINDOW_MS,
} from './video-playback-active.js'

describe('isVideoPlaybackActive', () => {
  it('is true within 3 s of a progress tick', () => {
    expect(
      isVideoPlaybackActive({
        status: 'Idle',
        lastProgressAt: 10_000,
        now: 10_000 + VIDEO_ACTIVE_WINDOW_MS,
      }),
    ).toBe(true)
  })

  it('is false after the 3 s window', () => {
    expect(
      isVideoPlaybackActive({
        status: 'Idle',
        lastProgressAt: 10_000,
        now: 10_000 + VIDEO_ACTIVE_WINDOW_MS + 1,
      }),
    ).toBe(false)
  })

  it('is true while Starting', () => {
    expect(
      isVideoPlaybackActive({
        status: 'Starting',
        lastProgressAt: null,
        now: 50_000,
      }),
    ).toBe(true)
  })
})
