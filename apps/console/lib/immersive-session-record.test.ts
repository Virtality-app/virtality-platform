import { describe, expect, it } from 'vitest'
import {
  initialImmersivePlaybackState,
  reduceImmersivePlayback,
  type ImmersivePlaybackAction,
  type ImmersivePlaybackState,
} from './immersive-video-playback-reducer'
import {
  decideImmersiveSessionRecord,
  type ImmersiveSessionRecordContext,
} from './immersive-session-record'

function run(
  state: ImmersivePlaybackState,
  ...actions: ImmersivePlaybackAction[]
): ImmersivePlaybackState {
  return actions.reduce(reduceImmersivePlayback, state)
}

const progress = (positionSec: number, videoId = 'trail') =>
  ({
    type: 'progress',
    payload: { videoId, positionSec, durationSec: 180 },
    now: 1,
  }) satisfies ImmersivePlaybackAction

const starting = (videoId = 'trail') =>
  run(initialImmersivePlaybackState, { type: 'playSent', videoId })

const playing = (videoId = 'trail') =>
  run(starting(videoId), { type: 'playAck', videoId })

const closed: ImmersiveSessionRecordContext = {
  openVideoId: null,
  timeLimitFired: false,
}
const open = (
  videoId = 'trail',
  patch: Partial<ImmersiveSessionRecordContext> = {},
): ImmersiveSessionRecordContext => ({
  openVideoId: videoId,
  timeLimitFired: false,
  ...patch,
})

describe('decideImmersiveSessionRecord', () => {
  it('starts a session when the headset confirms play', () => {
    const prev = starting()
    const next = run(prev, { type: 'playAck', videoId: 'trail' })
    expect(decideImmersiveSessionRecord(prev, next, closed)).toEqual([
      { kind: 'start', videoId: 'trail' },
    ])
  })

  it('does not start on the play command alone', () => {
    const next = starting()
    expect(
      decideImmersiveSessionRecord(initialImmersivePlaybackState, next, closed),
    ).toEqual([])
  })

  it('does not start when the play times out', () => {
    const prev = starting()
    const next = run(prev, { type: 'playTimeout' })
    expect(decideImmersiveSessionRecord(prev, next, closed)).toEqual([])
  })

  it('ends as ENDED when the video finishes', () => {
    const prev = run(playing(), progress(170))
    const next = run(prev, { type: 'ended' })
    expect(decideImmersiveSessionRecord(prev, next, open())).toEqual([
      { kind: 'end', endReason: 'ENDED', lastPositionSec: 180 },
    ])
  })

  it('ends as STOPPED when the physio stops', () => {
    const prev = run(playing(), progress(42), { type: 'stopSent' })
    const next = run(prev, { type: 'stopAck', videoId: 'trail' })
    expect(decideImmersiveSessionRecord(prev, next, open())).toEqual([
      { kind: 'end', endReason: 'STOPPED', lastPositionSec: 42 },
    ])
  })

  it('ends as TIME_LIMIT when the Session Time Limit sent the stop', () => {
    const prev = run(playing(), progress(60), { type: 'stopSent' })
    const next = run(prev, { type: 'stopAck', videoId: 'trail' })
    expect(
      decideImmersiveSessionRecord(
        prev,
        next,
        open('trail', { timeLimitFired: true }),
      ),
    ).toEqual([{ kind: 'end', endReason: 'TIME_LIMIT', lastPositionSec: 60 }])
  })

  it('ends as INTERRUPTED when the headset leaves', () => {
    const prev = run(playing(), progress(30))
    const next = run(prev, { type: 'memberLeft' })
    expect(decideImmersiveSessionRecord(prev, next, open())).toEqual([
      { kind: 'end', endReason: 'INTERRUPTED', lastPositionSec: 30 },
    ])
  })

  it('ends as INTERRUPTED when a re-attach finds no video', () => {
    const prev = run(playing(), { type: 'roomComplete' })
    const next = run(prev, { type: 'reattachTimeout' })
    expect(decideImmersiveSessionRecord(prev, next, open())).toEqual([
      { kind: 'end', endReason: 'INTERRUPTED', lastPositionSec: undefined },
    ])
  })

  it('sends no position when the headset never reported one', () => {
    const prev = playing()
    const next = run(prev, { type: 'stopAck', videoId: 'trail' })
    expect(decideImmersiveSessionRecord(prev, next, open())).toEqual([
      { kind: 'end', endReason: 'STOPPED', lastPositionSec: undefined },
    ])
  })

  it('ends nothing when no session is open', () => {
    const prev = run(playing(), { type: 'memberLeft' })
    const next = run(
      prev,
      { type: 'roomComplete' },
      { type: 'reattachTimeout' },
    )
    expect(decideImmersiveSessionRecord(prev, next, closed)).toEqual([])
  })

  it('ends nothing for an end of a video other than the open one', () => {
    const prev = run(playing('lake'), progress(10, 'lake'))
    const next = run(prev, { type: 'ended' })
    expect(decideImmersiveSessionRecord(prev, next, open('trail'))).toEqual([])
  })

  it('ends the open session as STOPPED before starting the next one', () => {
    const prev = run(playing(), progress(20), {
      type: 'playSent',
      videoId: 'lake',
    })
    const next = run(prev, { type: 'playAck', videoId: 'lake' })
    expect(decideImmersiveSessionRecord(prev, next, open('trail'))).toEqual([
      { kind: 'end', endReason: 'STOPPED', lastPositionSec: 20 },
      { kind: 'start', videoId: 'lake' },
    ])
  })

  it('resumes when a returning console re-attaches from progress', () => {
    const prev = run(initialImmersivePlaybackState, { type: 'roomComplete' })
    const next = run(prev, progress(75))
    expect(decideImmersiveSessionRecord(prev, next, closed)).toEqual([
      { kind: 'resume', videoId: 'trail' },
    ])
  })

  it('keeps the open session when the same video re-attaches', () => {
    const prev = run(playing(), { type: 'roomComplete' })
    const next = run(prev, progress(75))
    expect(decideImmersiveSessionRecord(prev, next, open())).toEqual([])
  })

  it('resumes a session the headset loss ended once the headset returns', () => {
    const prev = run(
      playing(),
      { type: 'memberLeft' },
      { type: 'roomComplete' },
    )
    const next = run(prev, progress(90))
    expect(decideImmersiveSessionRecord(prev, next, closed)).toEqual([
      { kind: 'resume', videoId: 'trail' },
    ])
  })

  it('ignores progress while a session is already recorded', () => {
    const prev = playing()
    const next = run(prev, progress(5))
    expect(decideImmersiveSessionRecord(prev, next, open())).toEqual([])
  })

  it('does nothing when the state did not change', () => {
    const state = playing()
    expect(decideImmersiveSessionRecord(state, state, open())).toEqual([])
  })

  describe('when React batches several actions into one render', () => {
    it('starts when play and its ack land together', () => {
      const next = playing()
      expect(
        decideImmersiveSessionRecord(
          initialImmersivePlaybackState,
          next,
          closed,
        ),
      ).toEqual([{ kind: 'start', videoId: 'trail' }])
    })

    it('ends, then starts, when a stop and the next play land together', () => {
      const prev = run(playing(), progress(42))
      const next = run(
        prev,
        { type: 'stopAck', videoId: 'trail' },
        { type: 'playSent', videoId: 'trail' },
        { type: 'playAck', videoId: 'trail' },
      )
      expect(decideImmersiveSessionRecord(prev, next, open())).toEqual([
        { kind: 'end', endReason: 'STOPPED', lastPositionSec: 42 },
        { kind: 'start', videoId: 'trail' },
      ])
    })
  })
})
