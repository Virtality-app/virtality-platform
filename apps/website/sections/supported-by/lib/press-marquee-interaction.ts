export const PRESS_MARQUEE_DRAG_THRESHOLD_PX = 4
/** Touch contact wobbles more than a mouse; keep taps from becoming scrub drags. */
export const PRESS_MARQUEE_TOUCH_DRAG_THRESHOLD_PX = 12

export type MarqueeDragPhase = 'idle' | 'pending' | 'dragging'

export type MarqueeDragState = {
  phase: MarqueeDragPhase
  originX: number
  originOffset: number
  didDrag: boolean
}

export type MarqueeDragEvent =
  | { type: 'pointerdown'; x: number; offset: number }
  | {
      type: 'pointermove'
      x: number
      threshold?: number
      /** Live track offset; used to rebase when pending → dragging. */
      currentOffset?: number
    }
  | { type: 'pointerup' }
  | { type: 'pointercancel' }
  | { type: 'lostcapture' }
  | { type: 'consumeClickGuard' }

export type MarqueeDragResult = {
  state: MarqueeDragState
  /** True when the host should call setPointerCapture for this transition. */
  capturePointer: boolean
  /** True when the host should prevent the synthetic click (post-drag). */
  preventClick: boolean
}

export const initialMarqueeDragState: MarqueeDragState = {
  phase: 'idle',
  originX: 0,
  originOffset: 0,
  didDrag: false,
}

/**
 * Touch taps synthesize mouseenter and often never mouseleave (esp. after
 * target=_blank). Hover-pause must only apply when the device can truly hover.
 */
export function shouldPauseMarqueeOnHover(canHover: boolean): boolean {
  return canHover
}

/**
 * Mouse, pen, and touch can scrub the marquee. Touch uses a higher movement
 * threshold so logo taps still activate links without stalling auto-scroll.
 */
export function shouldTrackMarqueeDragPointer(_pointerType: string): boolean {
  return true
}

export function marqueeDragThresholdForPointer(pointerType: string): number {
  return pointerType === 'touch'
    ? PRESS_MARQUEE_TOUCH_DRAG_THRESHOLD_PX
    : PRESS_MARQUEE_DRAG_THRESHOLD_PX
}

export function shouldEndGestureOnLostCapture(buttons: number): boolean {
  // Some engines (notably during setPointerCapture on touch) emit a spurious
  // lostpointercapture while contact is still down. Aborting there kills scrub.
  return (buttons & 1) === 0
}

/**
 * Pointer capture helps mouse scrubbing leave the hit target; on touch it often
 * races with the browser and immediately fires lostpointercapture.
 */
export function shouldCaptureMarqueePointer(pointerType: string): boolean {
  return pointerType !== 'touch'
}

/**
 * Dropped pointerup after target=_blank can leave a stale pending mouse gesture.
 * Do not apply the buttons check to touch — some engines report buttons=0
 * while contact is still down, which would cancel every scrub attempt.
 */
export function shouldCancelStalePendingPointer(
  phase: MarqueeDragPhase,
  pointerType: string,
  buttons: number,
): boolean {
  if (phase !== 'pending' || pointerType !== 'mouse') {
    return false
  }

  return (buttons & 1) === 0
}

export function isMarqueeAutoScrollPaused(
  state: MarqueeDragState,
  hoverPaused: boolean,
  prefersReducedMotion: boolean,
): boolean {
  return state.phase === 'dragging' || hoverPaused || prefersReducedMotion
}

function releaseToIdle(state: MarqueeDragState): MarqueeDragState {
  return {
    ...state,
    phase: 'idle',
  }
}

export function reduceMarqueeDrag(
  state: MarqueeDragState,
  event: MarqueeDragEvent,
): MarqueeDragResult {
  switch (event.type) {
    case 'pointerdown':
      return {
        state: {
          phase: 'pending',
          originX: event.x,
          originOffset: event.offset,
          didDrag: false,
        },
        capturePointer: false,
        preventClick: false,
      }

    case 'pointermove': {
      if (state.phase === 'idle') {
        return { state, capturePointer: false, preventClick: false }
      }

      const threshold = event.threshold ?? PRESS_MARQUEE_DRAG_THRESHOLD_PX
      const deltaX = event.x - state.originX

      if (state.phase === 'pending') {
        if (Math.abs(deltaX) <= threshold) {
          return { state, capturePointer: false, preventClick: false }
        }

        return {
          state: {
            phase: 'dragging',
            // Rebase to the live pointer/offset so auto-scroll during pending
            // does not snap the track when scrubbing begins.
            originX: event.x,
            originOffset: event.currentOffset ?? state.originOffset,
            didDrag: true,
          },
          capturePointer: true,
          preventClick: false,
        }
      }

      return { state, capturePointer: false, preventClick: false }
    }

    case 'pointerup':
    case 'pointercancel':
    case 'lostcapture':
      if (state.phase === 'idle') {
        return { state, capturePointer: false, preventClick: false }
      }

      return {
        state: releaseToIdle(state),
        capturePointer: false,
        preventClick: false,
      }

    case 'consumeClickGuard':
      if (!state.didDrag) {
        return { state, capturePointer: false, preventClick: false }
      }

      return {
        state: { ...state, didDrag: false },
        capturePointer: false,
        preventClick: true,
      }
  }
}

export function marqueeOffsetDuringPointer(
  state: MarqueeDragState,
  clientX: number,
): number | null {
  if (state.phase !== 'dragging') {
    return null
  }

  return state.originOffset + (clientX - state.originX)
}
