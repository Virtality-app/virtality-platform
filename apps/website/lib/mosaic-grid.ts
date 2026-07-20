import type { MosaicTileListItem } from '@virtality/shared/types'

export const MOSAIC_GRID_MOBILE_SCALE_CLASS =
  'mx-auto w-full max-w-3xl origin-top scale-[0.82] sm:scale-100'

export function getMosaicTileGridStyle(
  tile: Pick<MosaicTileListItem, 'row' | 'col' | 'width' | 'height'>,
) {
  return {
    gridColumn: `${tile.col + 1} / span ${tile.width}`,
    gridRow: `${tile.row + 1} / span ${tile.height}`,
  }
}
