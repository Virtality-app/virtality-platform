'use client'

import { useState } from 'react'
import { Trash2, X } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import { Badge } from '@virtality/ui/components/badge'
import { formatByteSize } from '@/lib/headset-library-format'
import type { HeadsetLibraryCell } from '@/lib/headset-library-rows'
import { FailedLibraryCell } from './failed-library-cell'
import { LibraryCellDownloading } from './library-cell-downloading'
import {
  StorageWarningDialog,
  storageWarningCopy,
} from './storage-warning-dialog'
import { formatDistanceToNow } from 'date-fns'

export function needsStorageWarning(
  sizeBytes: number,
  freeBytes: number | null,
): boolean {
  return freeBytes != null && sizeBytes > freeBytes
}

function formatReportedAt(reportedAt?: string): string | null {
  if (!reportedAt) return null
  return formatDistanceToNow(new Date(reportedAt), { addSuffix: true })
}

export function LibraryCell({
  cell,
  roomComplete,
  frozen,
  sizeBytes,
  freeBytes,
  onDownload,
  onPause,
  onCancel,
  onDelete,
}: {
  cell: HeadsetLibraryCell
  roomComplete: boolean
  frozen: boolean
  sizeBytes: number
  freeBytes: number | null
  onDownload: () => void
  onPause: () => void
  onCancel: () => void
  onDelete: () => void
}) {
  const [warningOpen, setWarningOpen] = useState(false)
  const disabled = !roomComplete || frozen

  const requestDownload = () => {
    if (disabled) return
    if (needsStorageWarning(sizeBytes, freeBytes)) {
      setWarningOpen(true)
      return
    }
    onDownload()
  }

  const confirmDownload = () => {
    setWarningOpen(false)
    onDownload()
  }

  return (
    <div className='flex flex-col items-end gap-1'>
      {cell.type === 'on-headset' ? (
        <div className='flex items-center gap-2'>
          <Badge variant='secondary'>On headset</Badge>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            disabled={disabled}
            aria-label='Delete from headset'
            onClick={onDelete}
          >
            <Trash2 />
          </Button>
        </div>
      ) : null}

      {cell.type === 'update-available' ? (
        <div className='flex items-center gap-2'>
          <Badge>Update available</Badge>
          <Button
            type='button'
            size='sm'
            disabled={disabled}
            onClick={requestDownload}
          >
            Update
          </Button>
        </div>
      ) : null}

      {cell.type === 'downloading' ? (
        <LibraryCellDownloading
          percent={cell.percent}
          stalled={cell.stalled}
          disabled={disabled}
          onPause={onPause}
          onCancel={onCancel}
        />
      ) : null}

      {cell.type === 'paused' ? (
        <div className='flex flex-wrap items-center justify-end gap-2'>
          <Badge variant='secondary'>
            Paused · {formatByteSize(cell.bytesDownloaded)} of{' '}
            {formatByteSize(cell.sizeBytes)}
          </Badge>
          <Button
            type='button'
            size='sm'
            disabled={disabled}
            onClick={requestDownload}
          >
            Resume
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            disabled={disabled}
            aria-label='Cancel'
            onClick={onCancel}
          >
            <X />
          </Button>
        </div>
      ) : null}

      {cell.type === 'failed' ? (
        <FailedLibraryCell
          reason={cell.reason}
          disabled={disabled}
          onDownload={requestDownload}
        />
      ) : null}

      {cell.type === 'absent' ? (
        <Button
          type='button'
          size='sm'
          disabled={disabled}
          onClick={requestDownload}
        >
          Download ({formatByteSize(sizeBytes)})
        </Button>
      ) : null}

      {cell.type === 'offline-on-headset' ? (
        <Badge variant='secondary'>
          On headset
          {formatReportedAt(cell.reportedAt)
            ? ` · ${formatReportedAt(cell.reportedAt)}`
            : ''}
        </Badge>
      ) : null}

      {cell.type === 'offline-absent' ? (
        <div className='text-right'>
          <Badge variant='outline'>Not on headset</Badge>
          <p className='text-muted-foreground mt-1 text-xs'>
            Turn the headset on to download
          </p>
        </div>
      ) : null}

      {cell.type === 'not-in-catalog' ? (
        <div className='flex items-center gap-2'>
          <Badge variant='outline'>Not in catalog</Badge>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            disabled={disabled}
            aria-label='Delete from headset'
            onClick={onDelete}
          >
            <Trash2 />
          </Button>
        </div>
      ) : null}

      {cell.type === 'offline-downloading' ? (
        <Badge variant='secondary'>
          Downloading {cell.percent}%{cell.stalled ? ' · stalled' : ''}
        </Badge>
      ) : null}

      {cell.type === 'offline-paused' ? (
        <Badge variant='secondary'>
          Paused · {formatByteSize(cell.bytesDownloaded)} of{' '}
          {formatByteSize(cell.sizeBytes)}
        </Badge>
      ) : null}

      {cell.type === 'offline-failed' ? (
        <FailedLibraryCell reason={cell.reason} disabled />
      ) : null}

      <StorageWarningDialog
        open={warningOpen}
        description={storageWarningCopy(
          formatByteSize(freeBytes ?? 0),
          formatByteSize(sizeBytes),
        )}
        onCancel={() => setWarningOpen(false)}
        onConfirm={confirmDownload}
      />
    </div>
  )
}
