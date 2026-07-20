import {
  MOSAIC_GRID_SIZE,
  type MosaicMediaKind,
  type MosaicTilePlacement,
} from '@virtality/shared/types'
import { validateMosaicTilePlacement } from '@virtality/shared/utils'

export const MOSAIC_TRAY_DRAG_MIME =
  'application/x-virtality-mosaic-tray-item-id'

export type MosaicTrayItem = {
  id: string
  objectKey: string
  mediaKind: MosaicMediaKind
  alt: string
}

export type MosaicEditorTile = MosaicTilePlacement & {
  id: string
  objectKey: string
  mediaKind: MosaicMediaKind
  alt: string
}

export type MosaicEditorState = {
  tray: MosaicTrayItem[]
  tiles: MosaicEditorTile[]
}

export type MosaicGridCell = {
  row: number
  col: number
}

export type PlaceMosaicTileResult =
  | { ok: true; state: MosaicEditorState }
  | {
      ok: false
      reason: 'occupied' | 'out_of_bounds' | 'tray_item_missing' | 'invalid_alt'
    }

function cellsForPlacement(
  placement: MosaicTilePlacement,
): Array<{ row: number; col: number }> {
  const cells: Array<{ row: number; col: number }> = []

  for (
    let row = placement.row;
    row < placement.row + placement.height;
    row += 1
  ) {
    for (
      let col = placement.col;
      col < placement.col + placement.width;
      col += 1
    ) {
      cells.push({ row, col })
    }
  }

  return cells
}

function cellIsInTile(
  cell: { row: number; col: number },
  tile: MosaicTilePlacement,
): boolean {
  return (
    cell.row >= tile.row &&
    cell.row < tile.row + tile.height &&
    cell.col >= tile.col &&
    cell.col < tile.col + tile.width
  )
}

export function createEmptyMosaicEditorState(): MosaicEditorState {
  return { tray: [], tiles: [] }
}

export function addMosaicTrayItem(
  state: MosaicEditorState,
  item: MosaicTrayItem,
): MosaicEditorState {
  return {
    ...state,
    tray: [...state.tray, item],
  }
}

export function removeMosaicTrayItem(
  state: MosaicEditorState,
  trayItemId: string,
): MosaicEditorState {
  return {
    ...state,
    tray: state.tray.filter((item) => item.id !== trayItemId),
  }
}

export function isMosaicCellOccupied(
  tiles: readonly MosaicTilePlacement[],
  row: number,
  col: number,
): boolean {
  return tiles.some((tile) => cellIsInTile({ row, col }, tile))
}

export function getEmptyMosaicCells(
  tiles: readonly MosaicTilePlacement[],
): MosaicGridCell[] {
  const cells: MosaicGridCell[] = []

  for (let row = 0; row < MOSAIC_GRID_SIZE; row += 1) {
    for (let col = 0; col < MOSAIC_GRID_SIZE; col += 1) {
      if (!isMosaicCellOccupied(tiles, row, col)) {
        cells.push({ row, col })
      }
    }
  }

  return cells
}

export function canPlaceMosaicTileAt(
  tiles: readonly MosaicTilePlacement[],
  placement: MosaicTilePlacement,
): boolean {
  if (validateMosaicTilePlacement(placement).length > 0) {
    return false
  }

  return cellsForPlacement(placement).every(
    (cell) => !isMosaicCellOccupied(tiles, cell.row, cell.col),
  )
}

export function placeMosaicTileFromTray(
  state: MosaicEditorState,
  trayItemId: string,
  row: number,
  col: number,
  tileId: string,
): PlaceMosaicTileResult {
  const trayItem = state.tray.find((item) => item.id === trayItemId)

  if (!trayItem) {
    return { ok: false, reason: 'tray_item_missing' }
  }

  const trimmedAlt = trayItem.alt.trim()
  if (!trimmedAlt) {
    return { ok: false, reason: 'invalid_alt' }
  }

  const placement: MosaicTilePlacement = {
    row,
    col,
    width: 1,
    height: 1,
  }

  if (validateMosaicTilePlacement(placement).length > 0) {
    return { ok: false, reason: 'out_of_bounds' }
  }

  if (!canPlaceMosaicTileAt(state.tiles, placement)) {
    return { ok: false, reason: 'occupied' }
  }

  const tile: MosaicEditorTile = {
    id: tileId,
    objectKey: trayItem.objectKey,
    mediaKind: trayItem.mediaKind,
    alt: trimmedAlt,
    row,
    col,
    width: 1,
    height: 1,
  }

  return {
    ok: true,
    state: {
      ...removeMosaicTrayItem(state, trayItemId),
      tiles: [...state.tiles, tile],
    },
  }
}
