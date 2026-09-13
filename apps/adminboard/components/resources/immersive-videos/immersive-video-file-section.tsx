'use client'

import { ImmersiveVideoFilePicker } from '@/components/resources/immersive-videos/immersive-video-file-picker'
import type { ImmersiveVideoPickedFile } from '@/components/resources/immersive-videos/immersive-video-file-picker'
import { ImmersiveVideoIdField } from '@/components/resources/immersive-videos/immersive-video-id-field'
import { ImmersiveVideoUploadProgress } from '@/components/resources/immersive-videos/immersive-video-upload-progress'
import { Button } from '@/components/ui/button'
import { immersiveVideoHasFile } from '@/lib/immersive-video-admin-row'
import type { ImmersiveVideoAdminRow } from '@/lib/immersive-video-admin-row'
import {
  canChooseImmersiveVideoId,
  requestedImmersiveVideoId,
} from '@/lib/immersive-video-file-kind'
import type { ImmersiveVideoUploadController } from '@/hooks/use-immersive-video-upload'
import { useState } from 'react'

export type ImmersiveVideoFileRequest = ImmersiveVideoPickedFile & {
  /** Admin-chosen Video ID; null keeps the generated one. */
  requestedId: string | null
}

export function ImmersiveVideoFileSection({
  row,
  upload,
  onPickedFile,
}: {
  row: ImmersiveVideoAdminRow
  upload: ImmersiveVideoUploadController
  onPickedFile: (request: ImmersiveVideoFileRequest) => void
}) {
  const [idInput, setIdInput] = useState('')
  const isThisUpload = upload.activeVideoId === row.id
  const otherUploadActive = upload.isUploading && !isThisUpload
  const verifying = row.state === 'Verifying'
  const idEditable = canChooseImmersiveVideoId(row)

  if (verifying) {
    return <p className='text-muted-foreground text-sm'>Verifying file…</p>
  }

  if (isThisUpload) {
    return (
      <div className='space-y-2'>
        <ImmersiveVideoUploadProgress
          uploadedBytes={upload.uploadedBytes}
          totalBytes={upload.totalBytes}
        />
        <Button
          type='button'
          variant='outline'
          onClick={() => void upload.abortUpload(row.id)}
        >
          Cancel upload
        </Button>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <ImmersiveVideoIdField
        currentId={row.id}
        value={idInput}
        editable={idEditable}
        onChange={setIdInput}
      />
      {immersiveVideoHasFile(row) ? (
        <p className='text-sm'>{row.filename}</p>
      ) : (
        <p className='text-muted-foreground text-sm'>No file yet.</p>
      )}
      {otherUploadActive ? (
        <p className='text-sm'>{upload.otherRowsDisabledMessage}</p>
      ) : (
        <ImmersiveVideoFilePicker
          onPicked={(picked) =>
            onPickedFile({
              ...picked,
              requestedId: idEditable
                ? requestedImmersiveVideoId(idInput, row.id)
                : null,
            })
          }
        />
      )}
    </div>
  )
}
