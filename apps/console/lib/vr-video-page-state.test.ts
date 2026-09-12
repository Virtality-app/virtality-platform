import { describe, expect, it } from 'vitest'
import { selectedHeadsetOnline, vrVideoBanner } from './vr-video-page-state.js'

describe('vrVideoBanner', () => {
  it('asks the physio to turn the headset on when the poll is offline', () => {
    expect(
      vrVideoBanner({
        roomComplete: false,
        replaced: false,
        pollOnline: false,
      }),
    ).toBe('Turn the headset on and open the app to download videos.')
  })

  it('shows connecting copy when the poll is online but the room is not complete', () => {
    expect(
      vrVideoBanner({
        roomComplete: false,
        replaced: false,
        pollOnline: true,
      }),
    ).toBe('Connecting to headset…')
  })

  it('hides the banner once the room is complete', () => {
    expect(
      vrVideoBanner({
        roomComplete: true,
        replaced: false,
        pollOnline: false,
      }),
    ).toBeNull()
  })
})

describe('selectedHeadsetOnline', () => {
  it('treats a complete room as online even if the poll is stale', () => {
    expect(
      selectedHeadsetOnline({ roomComplete: true, pollOnline: false }),
    ).toBe(true)
  })
})
