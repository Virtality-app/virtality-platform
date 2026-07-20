type MosaicTilePlacement = {
  col: number
  row: number
  width: number
  height: number
}

export function getMosaicTileGridStyle(tile: MosaicTilePlacement) {
  return {
    gridColumn: `${tile.col + 1} / span ${tile.width}`,
    gridRow: `${tile.row + 1} / span ${tile.height}`,
  }
}
