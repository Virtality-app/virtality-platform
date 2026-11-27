import { describe, expect, it } from 'vitest'
import { getImmersiveWatched } from './immersive-session-display'

describe('getImmersiveWatched', () => {
  it('formats the position against the video length', () => {
    expect(
      getImmersiveWatched({ lastPositionSec: 452, videoDurationSec: 900 }),
    ).toEqual({ watched: '7:32', total: '15:00', percent: 50 })
  })

  it('caps the share at the full video', () => {
    expect(
      getImmersiveWatched({ lastPositionSec: 905, videoDurationSec: 900 })
        .percent,
    ).toBe(100)
  })

  it('has no share when the catalog has no length', () => {
    expect(
      getImmersiveWatched({ lastPositionSec: 60, videoDurationSec: null }),
    ).toEqual({ watched: '1:00', total: null, percent: null })
  })

  it('has nothing when the headset reported no position', () => {
    expect(
      getImmersiveWatched({ lastPositionSec: null, videoDurationSec: 900 }),
    ).toEqual({ watched: null, total: '15:00', percent: null })
  })
})
