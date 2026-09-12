'use client'

import type { HeadsetLibraryRow } from '@/lib/headset-library-rows'
import { LibraryCell } from './library-cell'

export function NotInCatalogRow({
  row,
  roomComplete,
  frozen,
  onDelete,
}: {
  row: HeadsetLibraryRow
  roomComplete: boolean
  frozen: boolean
  onDelete: () => void
}) {
  return (
    <div className='flex items-center gap-3 py-2'>
      <div className='bg-muted size-12 rounded' />
      <div className='min-w-0 flex-1'>
        <p className='truncate font-medium'>Not in catalog</p>
      </div>
      <LibraryCell
        cell={{ type: 'not-in-catalog' }}
        roomComplete={roomComplete}
        frozen={frozen}
        sizeBytes={row.sizeBytes}
        freeBytes={null}
        onDownload={() => undefined}
        onPause={() => undefined}
        onCancel={() => undefined}
        onDelete={onDelete}
      />
    </div>
  )
}
