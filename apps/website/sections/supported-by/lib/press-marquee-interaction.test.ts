import { describe, expect, it } from 'vitest'
import {
  initialMarqueeDragState,
  isMarqueeAutoScrollPaused,
  marqueeDragThresholdForPointer,
  marqueeOffsetDuringPointer,
  PRESS_MARQUEE_DRAG_THRESHOLD_PX,
  PRESS_MARQUEE_TOUCH_DRAG_THRESHOLD_PX,
  reduceMarqueeDrag,
  shouldCancelStalePendingPointer,
  shouldCaptureMarqueePointer,
  shouldEndGestureOnLostCapture,
  shouldPauseMarqueeOnHover,
  shouldTrackMarqueeDragPointer,
} from './press-marquee-interaction'

describe('press marquee pause policy', () => {
  it('does not apply hover-pause on devices without real hover (mobile sticky hover)', () => {
    // iOS synthesizes mouseenter on tap and often never fires mouseleave after
    // opening target=_blank — sticky hoverPaused would freeze the marquee.
    expect(shouldPauseMarqueeOnHover(false)).toBe(false)
    expect(
      isMarqueeAutoScrollPaused(initialMarqueeDragState, false, false),
    ).toBe(false)
    expect(
      isMarqueeAutoScrollPaused(initialMarqueeDragState, true, false),
    ).toBe(true)
  })

  it('keeps hover-pause available for fine-pointer hover devices', () => {
    expect(shouldPauseMarqueeOnHover(true)).toBe(true)
  })

  it('tracks drag gestures for mouse, pen, and touch', () => {
    expect(shouldTrackMarqueeDragPointer('touch')).toBe(true)
    expect(shouldTrackMarqueeDragPointer('mouse')).toBe(true)
    expect(shouldTrackMarqueeDragPointer('pen')).toBe(true)
  })

  it('uses a higher movement threshold for touch so taps do not become drags', () => {
    expect(marqueeDragThresholdForPointer('mouse')).toBe(
      PRESS_MARQUEE_DRAG_THRESHOLD_PX,
    )
    expect(marqueeDragThresholdForPointer('pen')).toBe(
      PRESS_MARQUEE_DRAG_THRESHOLD_PX,
    )
    expect(marqueeDragThresholdForPointer('touch')).toBe(
      PRESS_MARQUEE_TOUCH_DRAG_THRESHOLD_PX,
    )
    expect(PRESS_MARQUEE_TOUCH_DRAG_THRESHOLD_PX).toBeGreaterThan(
      PRESS_MARQUEE_DRAG_THRESHOLD_PX,
    )
  })

  it('only cancels stale pending mouse gestures when the primary button is up', () => {
    expect(shouldCancelStalePendingPointer('pending', 'mouse', 0)).toBe(true)
    expect(shouldCancelStalePendingPointer('pending', 'mouse', 1)).toBe(false)
    // Touch engines often report buttons=0 while contact is still down.
    expect(shouldCancelStalePendingPointer('pending', 'touch', 0)).toBe(false)
    expect(shouldCancelStalePendingPointer('dragging', 'mouse', 0)).toBe(false)
  })

  it('does not end a gesture on lostpointercapture while contact is still down', () => {
    expect(shouldEndGestureOnLostCapture(1)).toBe(false)
    expect(shouldEndGestureOnLostCapture(0)).toBe(true)
  })

  it('skips pointer capture for touch to avoid spurious lostpointercapture', () => {
    expect(shouldCaptureMarqueePointer('touch')).toBe(false)
    expect(shouldCaptureMarqueePointer('mouse')).toBe(true)
    expect(shouldCaptureMarqueePointer('pen')).toBe(true)
  })
})

describe('press marquee drag interaction', () => {
  it('does not pause auto-scroll on press alone (desktop click / mobile tap)', () => {
    const down = reduceMarqueeDrag(initialMarqueeDragState, {
      type: 'pointerdown',
      x: 100,
      offset: -40,
    })

    expect(down.state.phase).toBe('pending')
    expect(down.capturePointer).toBe(false)
    expect(isMarqueeAutoScrollPaused(down.state, false, false)).toBe(false)

    const up = reduceMarqueeDrag(down.state, { type: 'pointerup' })
    expect(up.state.phase).toBe('idle')
    expect(up.state.didDrag).toBe(false)
    expect(
      reduceMarqueeDrag(up.state, { type: 'consumeClickGuard' }).preventClick,
    ).toBe(false)
  })

  it('resumes auto-scroll if the pointer is lost after opening a new tab', () => {
    const down = reduceMarqueeDrag(initialMarqueeDragState, {
      type: 'pointerdown',
      x: 50,
      offset: 0,
    })
    const lost = reduceMarqueeDrag(down.state, { type: 'lostcapture' })

    expect(lost.state.phase).toBe('idle')
    expect(isMarqueeAutoScrollPaused(lost.state, false, false)).toBe(false)
  })

  it('only starts dragging after the movement threshold, then captures the pointer', () => {
    const down = reduceMarqueeDrag(initialMarqueeDragState, {
      type: 'pointerdown',
      x: 0,
      offset: -10,
    })

    const smallMove = reduceMarqueeDrag(down.state, {
      type: 'pointermove',
      x: 3,
    })
    expect(smallMove.state.phase).toBe('pending')
    expect(smallMove.capturePointer).toBe(false)
    expect(isMarqueeAutoScrollPaused(smallMove.state, false, false)).toBe(false)

    const dragStart = reduceMarqueeDrag(smallMove.state, {
      type: 'pointermove',
      x: 8,
    })
    expect(dragStart.state.phase).toBe('dragging')
    expect(dragStart.state.didDrag).toBe(true)
    expect(dragStart.capturePointer).toBe(true)
    expect(isMarqueeAutoScrollPaused(dragStart.state, false, false)).toBe(true)
    expect(dragStart.state.originX).toBe(8)
    expect(dragStart.state.originOffset).toBe(-10)
    expect(marqueeOffsetDuringPointer(dragStart.state, 8)).toBe(-10)
  })

  it('lets touch scrub after the touch threshold without pausing on tap wobble', () => {
    const down = reduceMarqueeDrag(initialMarqueeDragState, {
      type: 'pointerdown',
      x: 0,
      offset: -10,
    })
    const touchThreshold = marqueeDragThresholdForPointer('touch')

    const wobble = reduceMarqueeDrag(down.state, {
      type: 'pointermove',
      x: touchThreshold,
      threshold: touchThreshold,
    })
    expect(wobble.state.phase).toBe('pending')
    expect(isMarqueeAutoScrollPaused(wobble.state, false, false)).toBe(false)

    const dragStart = reduceMarqueeDrag(wobble.state, {
      type: 'pointermove',
      x: touchThreshold + 1,
      threshold: touchThreshold,
    })
    expect(dragStart.state.phase).toBe('dragging')
    expect(dragStart.capturePointer).toBe(true)
    expect(
      marqueeOffsetDuringPointer(dragStart.state, touchThreshold + 1),
    ).toBe(-10)
  })

  it('rebases the drag origin to the live offset when scrubbing starts', () => {
    // Auto-scroll keeps moving during pending; without rebase, the first scrub
    // frame snaps the track back to the stale pointerdown offset.
    const down = reduceMarqueeDrag(initialMarqueeDragState, {
      type: 'pointerdown',
      x: 0,
      offset: -10,
    })

    const dragStart = reduceMarqueeDrag(down.state, {
      type: 'pointermove',
      x: 20,
      currentOffset: -50,
    })

    expect(dragStart.state.phase).toBe('dragging')
    expect(dragStart.state.originX).toBe(20)
    expect(dragStart.state.originOffset).toBe(-50)
    expect(marqueeOffsetDuringPointer(dragStart.state, 20)).toBe(-50)
    expect(marqueeOffsetDuringPointer(dragStart.state, 30)).toBe(-40)
  })

  it('suppresses the click only after a real drag', () => {
    let state = reduceMarqueeDrag(initialMarqueeDragState, {
      type: 'pointerdown',
      x: 0,
      offset: 0,
    }).state
    state = reduceMarqueeDrag(state, { type: 'pointermove', x: 20 }).state
    state = reduceMarqueeDrag(state, { type: 'pointerup' }).state

    const guarded = reduceMarqueeDrag(state, { type: 'consumeClickGuard' })
    expect(guarded.preventClick).toBe(true)
    expect(guarded.state.didDrag).toBe(false)
  })
})
