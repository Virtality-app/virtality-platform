import { describe, expect, it } from 'vitest'
import type { HumanState } from '@/data/static/human-body'
import {
  bodyAreasHaveSameSelection,
  markedBodyAreas,
  parseBodyAreas,
  unmarkBodyArea,
} from './body-areas'

const state = (parts: Record<string, boolean>) =>
  Object.fromEntries(
    Object.entries(parts).map(([part, isActive]) => [part, { isActive }]),
  ) as unknown as HumanState

describe('markedBodyAreas', () => {
  it('lists active parts, front before back', () => {
    expect(
      markedBodyAreas({
        front: state({ neck: true, groin: false, 'upper-abdominals': true }),
        back: state({ lowerback: true }),
      }),
    ).toEqual([
      { view: 'front', part: 'neck' },
      { view: 'front', part: 'upper-abdominals' },
      { view: 'back', part: 'lowerback' },
    ])
  })

  it('is empty when nothing is stored', () => {
    expect(markedBodyAreas({ front: null, back: null })).toEqual([])
  })
})

describe('bodyAreasHaveSameSelection', () => {
  it('treats null and all-inactive as the same selection', () => {
    expect(
      bodyAreasHaveSameSelection(
        { front: null, back: null },
        { front: state({ neck: false }), back: state({ lowerback: false }) },
      ),
    ).toBe(true)
  })

  it('notices a part that changed on either view', () => {
    const before = { front: state({ neck: true }), back: null }
    expect(
      bodyAreasHaveSameSelection(before, {
        front: state({ neck: true }),
        back: state({ lowerback: true }),
      }),
    ).toBe(false)
    expect(
      bodyAreasHaveSameSelection(before, {
        front: state({ neck: false, groin: true }),
        back: null,
      }),
    ).toBe(false)
  })
})

describe('unmarkBodyArea', () => {
  it('unmarks one part on one view and leaves the rest', () => {
    const bodyAreas = {
      front: state({ neck: true, groin: true }),
      back: state({ neck: true }),
    }
    const next = unmarkBodyArea(bodyAreas, { view: 'front', part: 'neck' })
    expect(markedBodyAreas(next)).toEqual([
      { view: 'front', part: 'groin' },
      { view: 'back', part: 'neck' },
    ])
    expect(markedBodyAreas(bodyAreas)).toHaveLength(3)
  })

  it('leaves an empty view alone', () => {
    const bodyAreas = { front: null, back: null }
    expect(unmarkBodyArea(bodyAreas, { view: 'back', part: 'neck' })).toBe(
      bodyAreas,
    )
  })
})

describe('parseBodyAreas', () => {
  it('parses stored JSON and leaves empty views null', () => {
    expect(
      parseBodyAreas({
        bodyFront: JSON.stringify({ neck: { isActive: true } }),
        bodyBack: null,
      }),
    ).toEqual({ front: { neck: { isActive: true } }, back: null })
  })
})
