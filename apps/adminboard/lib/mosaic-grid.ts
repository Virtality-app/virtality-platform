import type { MosaicTileListItem } from '@virtality/shared/types'

type MosaicTileGridPlacement = Pick<
  MosaicTileListItem,
  'row' | 'col' | 'width' | 'height'
>

export function getMosaicTileGridStyle(tile: MosaicTileGridPlacement) {
  return {
    gridColumn: `${tile.col + 1} / span ${tile.width}`,
    gridRow: `${tile.row + 1} / span ${tile.height}`,
  }
}
