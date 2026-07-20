'use client'

import { MOSAIC_TRAY_DRAG_MIME, type MosaicTrayItem } from '@/lib/mosaic-editor'
import { bucketCdnUrl } from '@virtality/shared/utils'
import { Film } from 'lucide-react'
import Image from 'next/image'

type MosaicTrayProps = {
  items: MosaicTrayItem[]
}

const MosaicTray = ({ items }: MosaicTrayProps) => {
  return (
    <section aria-label='Staging tray' className='space-y-3'>
      <div>
        <h2 className='text-sm font-medium'>Staging tray</h2>
        <p className='text-muted-foreground text-sm'>
          Drag media from the tray onto empty board cells to place 1×1 tiles.
        </p>
      </div>

      {items.length === 0 ? (
        <div className='rounded-lg border border-dashed p-6 text-center'>
          <p className='text-muted-foreground text-sm'>
            No staged media yet. Add bucket objects to the tray before placing
            them on the board.
          </p>
        </div>
      ) : (
        <ul className='flex flex-wrap gap-3'>
          {items.map((item) => (
            <li key={item.id}>
              <button
                type='button'
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData(MOSAIC_TRAY_DRAG_MIME, item.id)
                  event.dataTransfer.effectAllowed = 'copy'
                }}
                className='hover:bg-accent flex w-36 flex-col gap-2 rounded-lg border p-2 text-left'
                aria-label={`Drag ${item.alt} onto the board`}
              >
                <div className='relative aspect-square overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900'>
                  {item.mediaKind === 'image' ? (
                    <Image
                      src={bucketCdnUrl(item.objectKey)}
                      alt=''
                      fill
                      className='object-cover'
                      sizes='144px'
                    />
                  ) : (
                    <div className='flex size-full items-center justify-center'>
                      <Film className='text-muted-foreground size-8' />
                    </div>
                  )}
                </div>
                <span className='line-clamp-2 text-xs font-medium'>
                  {item.alt}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default MosaicTray
