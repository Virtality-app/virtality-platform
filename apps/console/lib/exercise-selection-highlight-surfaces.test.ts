import { describe, expect, it } from 'vitest'
import {
  EXERCISE_GRID_FAMILY_CARD_SELECTED,
  EXERCISE_GRID_PATH,
  FLIP_CARD_PATH,
  PARTIAL_SELECTION_HIGHLIGHT_PROP,
  PARTIAL_SELECTION_RING_CLASS,
  readConsoleFile,
} from './catalog-first-authoring-surface-seams.js'

describe('exercise selection highlight surfaces', () => {
  it('uses the same blue card highlight when one side is selected as when both are', () => {
    const grid = readConsoleFile(EXERCISE_GRID_PATH)
    const flipCard = readConsoleFile(FLIP_CARD_PATH)

    expect(grid).toMatch(EXERCISE_GRID_FAMILY_CARD_SELECTED)
    expect(grid).not.toMatch(PARTIAL_SELECTION_HIGHLIGHT_PROP)

    expect(flipCard).not.toMatch(PARTIAL_SELECTION_HIGHLIGHT_PROP)
    expect(flipCard).not.toMatch(PARTIAL_SELECTION_RING_CLASS)
  })
})
