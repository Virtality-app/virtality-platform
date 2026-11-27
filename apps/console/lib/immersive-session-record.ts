import {
  isPlayingOrPaused,
  type ImmersivePlaybackLastEnd,
  type ImmersivePlaybackState,
} from './immersive-video-playback-reducer'

/** Mirrors the server's `ImmersiveSessionEndReason`. */
export type ImmersiveSessionEndReason =
  | 'ENDED'
  | 'STOPPED'
  | 'TIME_LIMIT'
  | 'INTERRUPTED'

/**
 * What to save for one playback transition:
 * - `start`: the headset confirmed play, so a new **Immersive Session** begins.
 * - `resume`: a console re-attached to a running video from progress (a
 *   reload, or a headset that came back). Adopt the patient's open session for
 *   that video, or start one when there is none.
 * - `end`: the open session is over.
 */
export type ImmersiveSessionRecordStep =
  | { kind: 'start'; videoId: string }
  | { kind: 'resume'; videoId: string }
  | {
      kind: 'end'
      endReason: ImmersiveSessionEndReason
      lastPositionSec: number | undefined
    }

export type ImmersiveSessionRecordContext = {
  /** The video of the session on record; `null` when none is open. */
  openVideoId: string | null
  /** The **Session Time Limit** sent the stop for this session. */
  timeLimitFired: boolean
}

function endReasonOf(
  lastEnd: ImmersivePlaybackLastEnd,
  timeLimitFired: boolean,
): ImmersiveSessionEndReason {
  switch (lastEnd.reason) {
    case 'ended':
      return 'ENDED'
    case 'stopped':
      return timeLimitFired ? 'TIME_LIMIT' : 'STOPPED'
    case 'lost':
      return 'INTERRUPTED'
  }
}

function isRunning(state: ImmersivePlaybackState): boolean {
  return isPlayingOrPaused(state.status) && state.videoId != null
}

/**
 * Whether `next` holds a video run that `prev` did not. React may batch
 * several playback actions into one render, so this compares the two states
 * rather than looking for one action: Starting → Playing, a different video,
 * or a stop/end followed at once by another play.
 */
function isNewRun(
  prev: ImmersivePlaybackState,
  next: ImmersivePlaybackState,
  endedNow: boolean,
): boolean {
  if (!isRunning(next)) return false
  if (!isRunning(prev) || prev.videoId !== next.videoId) return true
  // A lost headset leaves the status Playing, so only a real end counts.
  return endedNow && next.lastEnd?.reason !== 'lost'
}

/** The open video's last reported position, read before a new play reset it. */
function lastKnownPosition(
  state: ImmersivePlaybackState,
  videoId: string,
): number | undefined {
  return state.lastProgress?.videoId === videoId
    ? state.lastProgress.positionSec
    : undefined
}

/**
 * Turns one playback transition into the session saves it calls for. Pure:
 * the caller keeps the open session and runs the steps in order.
 */
export function decideImmersiveSessionRecord(
  prev: ImmersivePlaybackState,
  next: ImmersivePlaybackState,
  context: ImmersiveSessionRecordContext,
): ImmersiveSessionRecordStep[] {
  if (prev === next) return []
  const steps: ImmersiveSessionRecordStep[] = []
  let openVideoId = context.openVideoId

  const lastEnd = next.lastEnd
  const endedNow = lastEnd != null && lastEnd !== prev.lastEnd
  if (endedNow && openVideoId != null && lastEnd.videoId === openVideoId) {
    steps.push({
      kind: 'end',
      endReason: endReasonOf(lastEnd, context.timeLimitFired),
      lastPositionSec: lastEnd.positionSec ?? undefined,
    })
    openVideoId = null
  }

  // A re-attach (reload, or a headset back in the room) picks up where the
  // video already is; any other new run is the headset confirming play.
  const reattached = prev.reattaching && !next.reattaching && isRunning(next)
  if (!reattached && !isNewRun(prev, next, endedNow)) return steps
  if (next.videoId == null) return steps
  const videoId = next.videoId
  const kind = reattached ? 'resume' : 'start'
  if (kind === 'resume' && openVideoId === videoId) return steps

  if (openVideoId != null) {
    steps.push({
      kind: 'end',
      endReason: 'STOPPED',
      lastPositionSec: lastKnownPosition(next, openVideoId),
    })
  }
  steps.push({ kind, videoId })
  return steps
}
