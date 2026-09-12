'use client'

import { formatVideoMetaLine } from '@/lib/headset-library-format'
import type { HeadsetLibraryRow } from '@/lib/headset-library-rows'
import { LibraryCell } from './library-cell'

export function HeadsetLibraryRowView({
  row,
  roomComplete,
  frozen,
  freeBytes,
  onDownload,
  onPause,
  onCancel,
  onDelete,
}: {
  row: HeadsetLibraryRow
  roomComplete: boolean
  frozen: boolean
  freeBytes: number | null
  onDownload: () => void
  onPause: () => void
  onCancel: () => void
  onDelete: () => void
}) {
  return (
    <div className='flex items-center gap-3 py-2'>
      {row.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={row.thumbnailUrl}
          alt=''
          width={48}
          height={48}
          className='size-12 rounded object-cover'
        />
      ) : (
        <div className='bg-muted size-12 rounded' />
      )}
      <div className='min-w-0 flex-1'>
        <p className='truncate font-medium'>{row.title}</p>
        <p className='text-muted-foreground truncate text-xs'>
          {formatVideoMetaLine({
            activity: row.activity,
            durationSec: row.durationSec,
            sizeBytes: row.sizeBytes,
          })}
        </p>
      </div>
      <LibraryCell
        cell={row.cell}
        roomComplete={roomComplete}
        frozen={frozen}
        sizeBytes={row.sizeBytes}
        freeBytes={freeBytes}
        onDownload={onDownload}
        onPause={onPause}
        onCancel={onCancel}
        onDelete={onDelete}
      />
    </div>
  )
}
