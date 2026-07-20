import Image from 'next/image'
import type { MosaicTileListItem } from '@virtality/shared/types'
import {
  MOSAIC_TILE_FRAME_CLASS,
  getMosaicTileGridStyle,
} from '@/lib/mosaic-grid'
import { getMosaicImageTileProps } from '@/lib/mosaic-tile'

type MosaicImageTileProps = {
  tile: MosaicTileListItem
}

const MosaicImageTile = ({ tile }: MosaicImageTileProps) => {
  const tileImage = getMosaicImageTileProps(tile)

  if (!tileImage) {
    return null
  }

  const { src, alt } = tileImage

  return (
    <div
      className={MOSAIC_TILE_FRAME_CLASS}
      style={getMosaicTileGridStyle(tile)}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes='(max-width: 640px) 30vw, 240px'
        className='object-cover'
      />
    </div>
  )
}

export default MosaicImageTile
