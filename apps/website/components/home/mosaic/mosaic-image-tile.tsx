import Image from 'next/image'
import type { MosaicTileListItem } from '@virtality/shared/types'
import { getMosaicTileGridStyle } from '@/lib/mosaic-grid'
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
      className='relative overflow-hidden rounded-lg border border-vital-blue-100/80 bg-vital-blue-50/40'
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
