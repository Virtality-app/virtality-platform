'use client'

import { getMosaicTileGridStyle } from '@/lib/mosaic-grid'
import {
  getEmptyMosaicCells,
  MOSAIC_TRAY_DRAG_MIME,
  type MosaicEditorTile,
} from '@/lib/mosaic-editor'
import { cn } from '@/lib/utils'
import { bucketCdnUrl } from '@virtality/shared/utils'
import { Film } from 'lucide-react'
import Image from 'next/image'
import { useMemo, useState } from 'react'

type MosaicBoardEditorProps = {
  tiles: MosaicEditorTile[]
  onPlaceTile: (trayItemId: string, row: number, col: number) => void
}

function MosaicPlacedTile({ tile }: { tile: MosaicEditorTile }) {
  return (
    <div
      className='relative overflow-hidden rounded-md border bg-zinc-100 dark:bg-zinc-900'
      style={getMosaicTileGridStyle(tile)}
    >
      {tile.mediaKind === 'image' ? (
        <Image
          src={bucketCdnUrl(tile.objectKey)}
          alt={tile.alt}
          fill
          className='object-cover'
          sizes='(min-width: 768px) 200px, 120px'
        />
      ) : (
        <div className='flex size-full items-center justify-center'>
          <Film className='text-muted-foreground size-8' aria-hidden='true' />
          <span className='sr-only'>{tile.alt}</span>
        </div>
      )}
    </div>
  )
}

const MosaicBoardEditor = ({ tiles, onPlaceTile }: MosaicBoardEditorProps) => {
  const [activeDropCell, setActiveDropCell] = useState<{
    row: number
    col: number
  } | null>(null)
  const emptyCells = useMemo(() => getEmptyMosaicCells(tiles), [tiles])

  const handleDragOver = (
    event: React.DragEvent<HTMLDivElement>,
    row: number,
    col: number,
  ) => {
    if (!event.dataTransfer.types.includes(MOSAIC_TRAY_DRAG_MIME)) {
      return
    }

    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
    setActiveDropCell({ row, col })
  }

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
    row: number,
    col: number,
  ) => {
    event.preventDefault()
    setActiveDropCell(null)

    const trayItemId = event.dataTransfer.getData(MOSAIC_TRAY_DRAG_MIME)
    if (!trayItemId) {
      return
    }

    onPlaceTile(trayItemId, row, col)
  }

  return (
    <section className='space-y-3'>
      <div>
        <h2 className='text-sm font-medium'>Board editor</h2>
        <p className='text-muted-foreground text-sm'>
          Drop tray items onto empty cells. Occupied cells reject overlapping
          placements.
        </p>
      </div>

      <div
        className='grid aspect-square w-full max-w-xl grid-cols-3 grid-rows-3 gap-2'
        aria-label='Mosaic board editor'
        onDragLeave={(event) => {
          if (event.currentTarget.contains(event.relatedTarget as Node)) {
            return
          }
          setActiveDropCell(null)
        }}
      >
        {emptyCells.map(({ row, col }) => {
          const isActive =
            activeDropCell?.row === row && activeDropCell?.col === col

          return (
            <div
              key={`cell-${row}-${col}`}
              style={{
                gridColumn: col + 1,
                gridRow: row + 1,
              }}
              className={cn(
                'rounded-md border border-dashed',
                isActive
                  ? 'border-primary bg-primary/5'
                  : 'border-zinc-300 dark:border-zinc-700',
              )}
              onDragOver={(event) => handleDragOver(event, row, col)}
              onDrop={(event) => handleDrop(event, row, col)}
            />
          )
        })}

        {tiles.map((tile) => (
          <MosaicPlacedTile key={tile.id} tile={tile} />
        ))}
      </div>
    </section>
  )
}

export default MosaicBoardEditor
