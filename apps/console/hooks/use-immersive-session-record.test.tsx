import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  initialImmersivePlaybackState,
  reduceImmersivePlayback,
  type ImmersivePlaybackAction,
  type ImmersivePlaybackState,
} from '@/lib/immersive-video-playback-reducer'
import { useImmersiveSessionRecord } from './use-immersive-session-record'

const mocks = vi.hoisted(() => ({
  start: vi.fn(),
  end: vi.fn(),
  find: vi.fn(),
  invalidate: vi.fn(),
}))

vi.mock('@virtality/react-query', () => ({
  getQueryClient: () => ({ invalidateQueries: mocks.invalidate }),
  useORPC: () => ({
    patientSession: {
      list: { key: () => ['patientSession', 'list'], call: mocks.find },
    },
  }),
  useStartImmersiveSession: () => ({ mutateAsync: mocks.start }),
  useEndImmersiveSession: () => ({ mutateAsync: mocks.end }),
}))

function run(
  state: ImmersivePlaybackState,
  ...actions: ImmersivePlaybackAction[]
) {
  return actions.reduce(reduceImmersivePlayback, state)
}

function render(timeLimitFired = () => false) {
  return renderHook(
    ({ state }: { state: ImmersivePlaybackState }) =>
      useImmersiveSessionRecord({
        state,
        patientId: 'patient-1',
        roomCode: 'room-1',
        timeLimitFired,
      }),
    { initialProps: { state: initialImmersivePlaybackState } },
  )
}

beforeEach(() => {
  mocks.start.mockResolvedValue({})
  mocks.end.mockResolvedValue({})
  mocks.find.mockResolvedValue([])
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('useImmersiveSessionRecord', () => {
  it('starts on play-ack and ends the same session on stop', async () => {
    const { rerender } = render()
    let state = run(initialImmersivePlaybackState, {
      type: 'playSent',
      videoId: 'trail',
    })
    rerender({ state })
    expect(mocks.start).not.toHaveBeenCalled()

    state = run(state, { type: 'playAck', videoId: 'trail' })
    rerender({ state })
    state = run(state, { type: 'stopAck', videoId: 'trail' })
    rerender({ state })

    await waitFor(() => expect(mocks.end).toHaveBeenCalledTimes(1))
    const started = mocks.start.mock.calls[0][0]
    expect(started).toMatchObject({
      patientId: 'patient-1',
      immersiveVideoId: 'trail',
      roomCode: 'room-1',
    })
    expect(mocks.end).toHaveBeenCalledWith({
      sessionId: started.id,
      endReason: 'STOPPED',
      lastPositionSec: undefined,
    })
  })

  it('saves a time-limit stop as TIME_LIMIT', async () => {
    const { rerender } = render(() => true)
    let state = run(
      initialImmersivePlaybackState,
      { type: 'playSent', videoId: 'trail' },
      { type: 'playAck', videoId: 'trail' },
    )
    rerender({ state })
    state = run(state, { type: 'stopAck', videoId: 'trail' })
    rerender({ state })

    await waitFor(() =>
      expect(mocks.end).toHaveBeenCalledWith(
        expect.objectContaining({ endReason: 'TIME_LIMIT' }),
      ),
    )
  })

  it("adopts the patient's open session when a reload re-attaches", async () => {
    mocks.find.mockResolvedValue([
      {
        id: 'other-video-session',
        sessionImmersiveVideo: { immersiveVideoId: 'lake' },
      },
      {
        id: 'earlier-page-session',
        sessionImmersiveVideo: { immersiveVideoId: 'trail' },
      },
    ])
    const { rerender } = render()
    let state = run(initialImmersivePlaybackState, { type: 'roomComplete' })
    rerender({ state })
    state = run(state, {
      type: 'progress',
      payload: { videoId: 'trail', positionSec: 40, durationSec: 180 },
      now: 1,
    })
    rerender({ state })
    state = run(state, { type: 'ended' })
    rerender({ state })

    await waitFor(() => expect(mocks.end).toHaveBeenCalledTimes(1))
    expect(mocks.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          patientId: 'patient-1',
          kind: 'IMMERSIVE_VIDEO',
          status: 'ACTIVE',
        }),
      }),
    )
    expect(mocks.start).not.toHaveBeenCalled()
    expect(mocks.end).toHaveBeenCalledWith({
      sessionId: 'earlier-page-session',
      endReason: 'ENDED',
      lastPositionSec: 180,
    })
  })

  it('starts a session on re-attach when none is open', async () => {
    const { rerender } = render()
    let state = run(initialImmersivePlaybackState, { type: 'roomComplete' })
    rerender({ state })
    state = run(state, {
      type: 'progress',
      payload: { videoId: 'trail', positionSec: 40, durationSec: 180 },
      now: 1,
    })
    rerender({ state })

    await waitFor(() => expect(mocks.start).toHaveBeenCalledTimes(1))
  })

  it('keeps saving after a failed save', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    mocks.start.mockRejectedValueOnce(new Error('offline'))
    const { rerender } = render()
    let state = run(
      initialImmersivePlaybackState,
      { type: 'playSent', videoId: 'trail' },
      { type: 'playAck', videoId: 'trail' },
    )
    rerender({ state })
    state = run(
      state,
      { type: 'stopAck', videoId: 'trail' },
      { type: 'playSent', videoId: 'lake' },
      { type: 'playAck', videoId: 'lake' },
    )
    rerender({ state })

    await waitFor(() => expect(mocks.start).toHaveBeenCalledTimes(2))
    expect(mocks.start.mock.calls[1][0].immersiveVideoId).toBe('lake')
    error.mockRestore()
  })
})
