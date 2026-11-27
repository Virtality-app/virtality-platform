import type { VideoPlaybackProgressPayload } from '@virtality/shared/types'
import type {
  HeadsetDidNotConfirmIntent,
  HeadsetDidNotConfirmReason,
} from './headset-did-not-confirm'

export const PLAY_ACK_TIMEOUT_MS = 5_000
export const STOP_ACK_TIMEOUT_MS = 5_000
export const REATTACH_WAIT_MS = 2_000

export type ImmersivePlaybackStatus = 'Idle' | 'Starting' | 'Playing' | 'Paused'

export type PendingPlayMarker = { videoId: string; kind: 'play' }

export type PendingStopMarker = { videoId: string }

/**
 * How the last running video left the headset: it finished, the headset
 * confirmed a stop, or the headset was lost. A new object each time, so a
 * watcher can tell one end from the next.
 */
export type ImmersivePlaybackLastEnd = {
  videoId: string
  reason: 'ended' | 'stopped' | 'lost'
  /** Last reported position; `null` when the headset never reported one. */
  positionSec: number | null
}

export type ImmersiveConfirmIntent = Extract<
  HeadsetDidNotConfirmIntent,
  'play' | 'stop'
>

export type ImmersivePlaybackState = {
  status: ImmersivePlaybackStatus
  videoId: string | null
  positionSec: number
  durationSec: number
  pendingPlay: PendingPlayMarker | null
  /** `videoStop` sent; the video stays Playing/Paused until `videoStopAck`. */
  pendingStop: PendingStopMarker | null
  confirmReason: HeadsetDidNotConfirmReason | null
  /** Which command `confirmReason` is about. */
  confirmIntent: ImmersiveConfirmIntent
  reattaching: boolean
  lastProgress: VideoPlaybackProgressPayload | null
  lastProgressAt: number | null
  lastEnd: ImmersivePlaybackLastEnd | null
}

export type ImmersivePlaybackAction =
  | { type: 'playSent'; videoId: string }
  | { type: 'playAck'; videoId: string }
  | { type: 'playTimeout' }
  | { type: 'stopSent' }
  | { type: 'stopTimeout' }
  | { type: 'memberLeft' }
  | { type: 'roomComplete' }
  | { type: 'reattachTimeout' }
  | { type: 'progress'; payload: VideoPlaybackProgressPayload; now: number }
  | { type: 'pauseToggle' }
  | { type: 'ended' }
  | { type: 'stopAck'; videoId: string }
  | { type: 'dismissConfirm' }

export const initialImmersivePlaybackState: ImmersivePlaybackState = {
  status: 'Idle',
  videoId: null,
  positionSec: 0,
  durationSec: 0,
  pendingPlay: null,
  pendingStop: null,
  confirmReason: null,
  confirmIntent: 'play',
  reattaching: false,
  lastProgress: null,
  lastProgressAt: null,
  lastEnd: null,
}

export function isPlayingOrPaused(status: ImmersivePlaybackStatus): boolean {
  return status === 'Playing' || status === 'Paused'
}

export function isImmersivePlaybackBlocking(
  status: ImmersivePlaybackStatus,
): boolean {
  return status === 'Starting' || isPlayingOrPaused(status)
}

/**
 * The end of the video the headset holds, or `null` when none was running
 * (Idle, or Starting before the play-ack). Progress is the only source of
 * position, so a video that never reported one ends with `null`.
 */
function endOfRunningVideo(
  state: ImmersivePlaybackState,
  reason: ImmersivePlaybackLastEnd['reason'],
): ImmersivePlaybackLastEnd | null {
  if (!isPlayingOrPaused(state.status) || state.videoId == null) return null
  const reported = state.durationSec > 0
  return {
    videoId: state.videoId,
    reason,
    positionSec: !reported
      ? null
      : reason === 'ended'
        ? state.durationSec
        : state.positionSec,
  }
}

function withLastEnd(
  state: ImmersivePlaybackState,
  lastEnd: ImmersivePlaybackLastEnd | null,
): ImmersivePlaybackState {
  return lastEnd ? { ...state, lastEnd } : state
}

function toIdle(
  state: ImmersivePlaybackState,
  keep: Pick<
    ImmersivePlaybackState,
    'confirmReason' | 'lastProgress' | 'lastProgressAt'
  >,
): ImmersivePlaybackState {
  return {
    ...state,
    status: 'Idle',
    videoId: null,
    positionSec: 0,
    durationSec: 0,
    pendingPlay: null,
    pendingStop: null,
    reattaching: false,
    confirmReason: keep.confirmReason,
    lastProgress: keep.lastProgress,
    lastProgressAt: keep.lastProgressAt,
  }
}

/**
 * Progress carries no pause flag, so a rejoining console always lands on
 * Playing; the physio's next `videoPause` toggles from there.
 */
function attachFromProgress(
  state: ImmersivePlaybackState,
  payload: VideoPlaybackProgressPayload,
  now: number,
): ImmersivePlaybackState {
  return {
    ...state,
    status: 'Playing',
    videoId: payload.videoId,
    positionSec: payload.positionSec,
    durationSec: payload.durationSec,
    pendingPlay: null,
    reattaching: false,
    lastProgress: payload,
    lastProgressAt: now,
  }
}

export function reduceImmersivePlayback(
  state: ImmersivePlaybackState,
  action: ImmersivePlaybackAction,
): ImmersivePlaybackState {
  switch (action.type) {
    case 'playSent':
      return {
        ...state,
        status: 'Starting',
        videoId: action.videoId,
        pendingPlay: { videoId: action.videoId, kind: 'play' },
        pendingStop: null,
        confirmReason: null,
        reattaching: false,
        positionSec: 0,
        durationSec: 0,
      }
    case 'playAck': {
      if (state.pendingPlay?.videoId !== action.videoId) return state
      return {
        ...state,
        status: 'Playing',
        videoId: action.videoId,
        pendingPlay: null,
      }
    }
    case 'playTimeout': {
      if (state.pendingPlay == null) return state
      return {
        ...toIdle(state, {
          confirmReason: 'didnt-respond',
          lastProgress: state.lastProgress,
          lastProgressAt: state.lastProgressAt,
        }),
        confirmIntent: 'play',
      }
    }
    case 'stopSent':
      if (!isPlayingOrPaused(state.status) || state.videoId == null) {
        return state
      }
      if (state.pendingStop != null) return state
      return { ...state, pendingStop: { videoId: state.videoId } }
    // The headset never confirmed, so it may still be playing: keep the
    // status and let the physio press Stop again.
    case 'stopTimeout':
      if (state.pendingStop == null) return state
      return {
        ...state,
        pendingStop: null,
        confirmReason: 'didnt-respond',
        confirmIntent: 'stop',
      }
    case 'memberLeft': {
      if (state.pendingPlay != null) {
        return {
          ...toIdle(state, {
            confirmReason: 'disconnected',
            lastProgress: state.lastProgress,
            lastProgressAt: state.lastProgressAt,
          }),
          confirmIntent: 'play',
        }
      }
      // The status stays Playing/Paused so a returning headset can
      // re-attach, but the run on record ends here.
      const lastEnd = endOfRunningVideo(state, 'lost')
      if (state.pendingStop != null) {
        return withLastEnd(
          {
            ...state,
            pendingStop: null,
            reattaching: false,
            confirmReason: 'disconnected',
            confirmIntent: 'stop',
          },
          lastEnd,
        )
      }
      return withLastEnd({ ...state, reattaching: false }, lastEnd)
    }
    case 'roomComplete':
      return { ...state, reattaching: true }
    case 'reattachTimeout': {
      if (!state.reattaching) return state
      return withLastEnd(
        toIdle(state, {
          confirmReason: state.confirmReason,
          lastProgress: state.lastProgress,
          lastProgressAt: state.lastProgressAt,
        }),
        endOfRunningVideo(state, 'lost'),
      )
    }
    case 'progress': {
      const next: ImmersivePlaybackState = {
        ...state,
        lastProgress: action.payload,
        lastProgressAt: action.now,
      }
      if (state.reattaching) {
        return attachFromProgress(next, action.payload, action.now)
      }
      if (isPlayingOrPaused(state.status)) {
        return {
          ...next,
          videoId: action.payload.videoId,
          positionSec: action.payload.positionSec,
          durationSec: action.payload.durationSec,
        }
      }
      return next
    }
    // One `videoPause` toggles, like the program's pause.
    case 'pauseToggle':
      if (state.status === 'Playing') return { ...state, status: 'Paused' }
      if (state.status === 'Paused') return { ...state, status: 'Playing' }
      return state
    case 'ended':
      if (!isImmersivePlaybackBlocking(state.status)) return state
      return withLastEnd(
        toIdle(state, {
          confirmReason: state.confirmReason,
          lastProgress: state.lastProgress,
          lastProgressAt: state.lastProgressAt,
        }),
        endOfRunningVideo(state, 'ended'),
      )
    case 'stopAck':
      // `videoStop` honoured for the named video; a stale ack for another
      // video (the physio already started the next one) changes nothing.
      if (!isImmersivePlaybackBlocking(state.status)) return state
      if (state.videoId !== action.videoId) return state
      return withLastEnd(
        toIdle(state, {
          confirmReason: state.confirmReason,
          lastProgress: state.lastProgress,
          lastProgressAt: state.lastProgressAt,
        }),
        endOfRunningVideo(state, 'stopped'),
      )
    case 'dismissConfirm':
      return { ...state, confirmReason: null }
    default:
      return state
  }
}
