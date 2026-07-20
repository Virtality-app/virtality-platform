import type { MosaicTilePlacement } from '@virtality/shared/types'
import { describe, expect, it } from 'vitest'
import {
  addMosaicTrayItem,
  canPlaceMosaicTileAt,
  clearMosaicEditorState,
  createEmptyMosaicEditorState,
  getEmptyMosaicCells,
  getLegalMosaicSpansForTile,
  isMosaicCellOccupied,
  mosaicEditorTilesToSaveInput,
  placeMosaicTileFromTray,
  removeMosaicTileFromBoard,
  resizeMosaicTile,
  type MosaicEditorTile,
} from './mosaic-editor'

const trayItem = {
  id: 'tray-1',
  objectKey: 'marketing/photo.jpg',
  mediaKind: 'image' as const,
  alt: 'Clinic scene',
}

describe('mosaic editor placement', () => {
  it('tracks occupied cells from placed tiles', () => {
    const tiles: MosaicTilePlacement[] = [
      { row: 0, col: 0, width: 1, height: 1 },
    ]

    expect(isMosaicCellOccupied(tiles, 0, 0)).toBe(true)
    expect(isMosaicCellOccupied(tiles, 0, 1)).toBe(false)
  })

  it('lists empty board cells for drop targets', () => {
    const tiles: MosaicTilePlacement[] = [
      { row: 0, col: 0, width: 1, height: 1 },
    ]

    expect(getEmptyMosaicCells(tiles)).toEqual([
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
      { row: 1, col: 2 },
      { row: 2, col: 0 },
      { row: 2, col: 1 },
      { row: 2, col: 2 },
    ])
  })

  it('allows placement only on empty in-bounds cells', () => {
    const tiles: MosaicTilePlacement[] = [
      { row: 0, col: 0, width: 1, height: 1 },
    ]

    expect(
      canPlaceMosaicTileAt(tiles, { row: 0, col: 1, width: 1, height: 1 }),
    ).toBe(true)
    expect(
      canPlaceMosaicTileAt(tiles, { row: 0, col: 0, width: 1, height: 1 }),
    ).toBe(false)
    expect(
      canPlaceMosaicTileAt(tiles, { row: 2, col: 2, width: 2, height: 1 }),
    ).toBe(false)
  })

  it('places a 1x1 tile from the tray and removes the tray item', () => {
    const state = addMosaicTrayItem(createEmptyMosaicEditorState(), trayItem)

    const result = placeMosaicTileFromTray(state, trayItem.id, 1, 2, 'tile-1')

    expect(result).toEqual({
      ok: true,
      state: {
        tray: [],
        tiles: [
          {
            id: 'tile-1',
            objectKey: trayItem.objectKey,
            mediaKind: 'image',
            alt: trayItem.alt,
            row: 1,
            col: 2,
            width: 1,
            height: 1,
          },
        ],
      },
    })
  })

  it('rejects overlapping drops onto occupied cells', () => {
    const withTray = addMosaicTrayItem(createEmptyMosaicEditorState(), trayItem)
    const placed = placeMosaicTileFromTray(
      withTray,
      trayItem.id,
      0,
      0,
      'tile-1',
    )

    expect(placed.ok).toBe(true)
    if (!placed.ok) {
      return
    }

    const secondTrayItem = {
      ...trayItem,
      id: 'tray-2',
      objectKey: 'marketing/photo-2.jpg',
    }
    const retryState = addMosaicTrayItem(placed.state, secondTrayItem)
    const overlap = placeMosaicTileFromTray(
      retryState,
      secondTrayItem.id,
      0,
      0,
      'tile-2',
    )

    expect(overlap).toEqual({ ok: false, reason: 'occupied' })
  })
})

const placedTile = (
  overrides: Partial<MosaicEditorTile> &
    Pick<MosaicEditorTile, 'id' | 'row' | 'col'>,
): MosaicEditorTile => ({
  objectKey: 'marketing/photo.jpg',
  mediaKind: 'image',
  alt: 'Clinic scene',
  width: 1,
  height: 1,
  ...overrides,
})

describe('mosaic editor resize, remove, and save helpers', () => {
  it('offers only legal spans from the tile origin into free cells', () => {
    const tiles = [
      placedTile({ id: 'tile-1', row: 0, col: 0 }),
      placedTile({
        id: 'tile-2',
        row: 0,
        col: 1,
        objectKey: 'marketing/photo-2.jpg',
        alt: 'Second tile',
      }),
    ]

    expect(getLegalMosaicSpansForTile(tiles, 'tile-1')).toEqual([
      { width: 1, height: 1 },
      { width: 1, height: 2 },
    ])
    expect(getLegalMosaicSpansForTile(tiles, 'tile-1')).not.toContainEqual({
      width: 2,
      height: 1,
    })
  })

  it('resizes a tile when the requested span fits free cells', () => {
    const state = {
      tray: [],
      tiles: [placedTile({ id: 'tile-1', row: 0, col: 0 })],
    }

    const result = resizeMosaicTile(state, 'tile-1', { width: 2, height: 1 })

    expect(result).toEqual({
      ok: true,
      state: {
        tray: [],
        tiles: [
          placedTile({ id: 'tile-1', row: 0, col: 0, width: 2, height: 1 }),
        ],
      },
    })
  })

  it('rejects illegal resize spans', () => {
    const state = {
      tray: [],
      tiles: [
        placedTile({ id: 'tile-1', row: 0, col: 0 }),
        placedTile({
          id: 'tile-2',
          row: 0,
          col: 1,
          objectKey: 'marketing/photo-2.jpg',
          alt: 'Second tile',
        }),
      ],
    }

    expect(resizeMosaicTile(state, 'tile-1', { width: 2, height: 1 })).toEqual({
      ok: false,
      reason: 'illegal_span',
    })
  })

  it('returns a removed tile to the tray', () => {
    const state = {
      tray: [],
      tiles: [placedTile({ id: 'tile-1', row: 1, col: 1 })],
    }

    expect(removeMosaicTileFromBoard(state, 'tile-1', 'tray-returned')).toEqual(
      {
        tray: [
          {
            id: 'tray-returned',
            objectKey: 'marketing/photo.jpg',
            mediaKind: 'image',
            alt: 'Clinic scene',
          },
        ],
        tiles: [],
      },
    )
  })

  it('clears editor state without touching save payload helpers', () => {
    const state = {
      tray: [trayItem],
      tiles: [placedTile({ id: 'tile-1', row: 0, col: 0 })],
    }

    expect(clearMosaicEditorState()).toEqual(createEmptyMosaicEditorState())
    expect(mosaicEditorTilesToSaveInput(state.tiles)).toEqual([
      {
        objectKey: 'marketing/photo.jpg',
        mediaKind: 'image',
        alt: 'Clinic scene',
        row: 0,
        col: 0,
        width: 1,
        height: 1,
      },
    ])
  })
})
