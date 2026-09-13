'use client'

import { ImmersiveVideoFileKindSelect } from '@/components/resources/immersive-videos/immersive-video-file-kind-select'
import { Button } from '@/components/ui/button'
import {
  DEFAULT_IMMERSIVE_VIDEO_FILE_KIND,
  immersiveVideoFileKindSpec,
  type ImmersiveVideoFileKind,
} from '@/lib/immersive-video-file-kind'
import { Input } from '@virtality/ui/components/input'
import { useState } from 'react'

export type ImmersiveVideoPickedFile = {
  file: File
  kind: ImmersiveVideoFileKind
}

/**
 * Kind selector plus a file input whose accept filter follows the kind.
 * Picking a file only stages it; `onPicked` fires from the Upload button so
 * an admin can still change their mind before bytes move.
 */
export function ImmersiveVideoFilePicker({
  onPicked,
}: {
  onPicked: (picked: ImmersiveVideoPickedFile) => void
}) {
  const [kind, setKind] = useState<ImmersiveVideoFileKind>(
    DEFAULT_IMMERSIVE_VIDEO_FILE_KIND,
  )
  const [file, setFile] = useState<File | null>(null)
  const spec = immersiveVideoFileKindSpec(kind)

  return (
    <div className='space-y-2'>
      <ImmersiveVideoFileKindSelect
        value={kind}
        onChange={(next) => {
          setKind(next)
          setFile(null)
        }}
      />
      <p className='text-muted-foreground text-sm'>{spec.hint}</p>
      <Input
        key={kind}
        type='file'
        accept={spec.accept}
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />
      <Button
        type='button'
        variant='primary'
        disabled={!file}
        onClick={() => {
          if (file) onPicked({ file, kind })
        }}
      >
        Upload
      </Button>
    </div>
  )
}
