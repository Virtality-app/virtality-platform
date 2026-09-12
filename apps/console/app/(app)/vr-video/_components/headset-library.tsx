'use client'

import type { HeadsetLibraryRow } from '@/lib/headset-library-rows'
import { HeadsetLibraryHeader } from './headset-library-header'
import { HeadsetLibraryRowView } from './headset-library-row'
import { NotInCatalogRow } from './not-in-catalog-row'

export function HeadsetLibrary({
  name,
  online,
  subtitle,
  banner,
  rows,
  roomComplete,
  frozen,
  freeBytes,
  onDownload,
  onPause,
  onCancel,
  onDelete,
}: {
  name: string
  online: boolean
  subtitle: string
  banner: string | null
  rows: HeadsetLibraryRow[]
  roomComplete: boolean
  frozen: boolean
  freeBytes: number | null
  onDownload: (videoId: string) => void
  onPause: (videoId: string) => void
  onCancel: (videoId: string) => void
  onDelete: (videoId: string) => void
}) {
  const catalogRows: HeadsetLibraryRow[] = []
  const extraRows: HeadsetLibraryRow[] = []
  for (const row of rows) {
    if (row.inCatalog) catalogRows.push(row)
    else extraRows.push(row)
  }

  return (
    <div>
      <HeadsetLibraryHeader name={name} online={online} subtitle={subtitle} />
      {banner ? (
        <p className='text-muted-foreground mb-3 text-sm'>{banner}</p>
      ) : null}
      <div className='divide-y'>
        {catalogRows.map((row) => (
          <HeadsetLibraryRowView
            key={row.videoId}
            row={row}
            roomComplete={roomComplete}
            frozen={frozen}
            freeBytes={freeBytes}
            onDownload={() => onDownload(row.videoId)}
            onPause={() => onPause(row.videoId)}
            onCancel={() => onCancel(row.videoId)}
            onDelete={() => onDelete(row.videoId)}
          />
        ))}
        {extraRows.map((row) => (
          <NotInCatalogRow
            key={row.videoId}
            row={row}
            roomComplete={roomComplete}
            frozen={frozen}
            onDelete={() => onDelete(row.videoId)}
          />
        ))}
      </div>
    </div>
  )
}
