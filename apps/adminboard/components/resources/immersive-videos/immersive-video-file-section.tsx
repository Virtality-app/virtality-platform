'use client'

import { ImmersiveVideoUploadProgress } from '@/components/resources/immersive-videos/immersive-video-upload-progress'
import { Button } from '@/components/ui/button'
import {
  IMMERSIVE_VIDEO_FILE_HINT,
  immersiveVideoHasFile,
} from '@/lib/immersive-video-admin-row'
import type { ImmersiveVideoAdminRow } from '@/lib/immersive-video-admin-row'
import type { ImmersiveVideoUploadController } from '@/hooks/use-immersive-video-upload'
import { Input } from '@virtality/ui/components/input'

export function ImmersiveVideoFileSection({
  row,
  upload,
  onPickedFile,
}: {
  row: ImmersiveVideoAdminRow
  upload: ImmersiveVideoUploadController
  onPickedFile: (file: File) => void
}) {
  const isThisUpload = upload.activeVideoId === row.id
  const otherUploadActive = upload.isUploading && !isThisUpload
  const verifying = row.state === 'Verifying'

  if (verifying) {
    return (
      <p className='text-muted-foreground text-sm'>
        Verifying file… This runs on the server; you can leave this page.
      </p>
    )
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
    <div className='space-y-2'>
      {immersiveVideoHasFile(row) ? (
        <p className='text-sm'>{row.filename}</p>
      ) : (
        <p className='text-muted-foreground text-sm'>No file yet.</p>
      )}
      <p className='text-muted-foreground text-sm'>
        {IMMERSIVE_VIDEO_FILE_HINT}
      </p>
      {otherUploadActive ? (
        <p className='text-sm'>{upload.otherRowsDisabledMessage}</p>
      ) : (
        <Input
          type='file'
          accept='video/*,.mp4,.m4v,.mov,.webm,.mkv'
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) onPickedFile(file)
          }}
        />
      )}
    </div>
  )
}
