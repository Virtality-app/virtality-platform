export const PRESS_MARQUEE_DRAG_THRESHOLD_PX = 4

export type MarqueeDragPhase = 'idle' | 'pending' | 'dragging'

export type MarqueeDragState = {
  phase: MarqueeDragPhase
  originX: number
  originOffset: number
  didDrag: boolean
}

export type MarqueeDragEvent =
  | { type: 'pointerdown'; x: number; offset: number }
  | { type: 'pointermove'; x: number; threshold?: number }
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
            ...state,
            phase: 'dragging',
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
