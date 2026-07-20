import type { MosaicTileListItem } from '@virtality/shared/types'

export const MOSAIC_GRID_MOBILE_SCALE_CLASS =
  'mx-auto w-full max-w-3xl origin-top scale-[0.82] sm:scale-100'

export const MOSAIC_TILE_FRAME_CLASS =
  'relative overflow-hidden rounded-lg border border-vital-blue-100/80 bg-vital-blue-50/40'

export const MOSAIC_TILE_OPEN_HOVER_CLASS =
  'cursor-pointer transition-opacity hover:opacity-95'

export const MOSAIC_LIGHTBOX_MAX_HEIGHT_CLASS = 'max-h-[85vh]'

export function getMosaicTileGridStyle(
  tile: Pick<MosaicTileListItem, 'row' | 'col' | 'width' | 'height'>,
) {
  return {
    gridColumn: `${tile.col + 1} / span ${tile.width}`,
    gridRow: `${tile.row + 1} / span ${tile.height}`,
  }
}
