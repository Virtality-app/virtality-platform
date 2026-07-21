import { describe, expect, it } from 'vitest'
import {
  initialMarqueeDragState,
  isMarqueeAutoScrollPaused,
  marqueeOffsetDuringPointer,
  reduceMarqueeDrag,
} from './press-marquee-interaction'

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
    expect(marqueeOffsetDuringPointer(dragStart.state, 8)).toBe(-2)
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
