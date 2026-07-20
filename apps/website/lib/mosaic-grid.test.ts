import { describe, expect, it } from 'vitest'
import { getMosaicTileGridStyle } from './mosaic-grid'

describe('mosaic grid placement', () => {
  it('maps saved row, col, and span onto a CSS 3×3 grid', () => {
    expect(
      getMosaicTileGridStyle({ row: 0, col: 0, width: 2, height: 2 }),
    ).toEqual({
      gridColumn: '1 / span 2',
      gridRow: '1 / span 2',
    })

    expect(
      getMosaicTileGridStyle({ row: 2, col: 2, width: 1, height: 1 }),
    ).toEqual({
      gridColumn: '3 / span 1',
      gridRow: '3 / span 1',
    })
  })
})
