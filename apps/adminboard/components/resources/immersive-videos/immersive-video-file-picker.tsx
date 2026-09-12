'use client'

import { ImmersiveVideoFileKindSelect } from '@/components/resources/immersive-videos/immersive-video-file-kind-select'
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

/** Kind selector plus a file input whose accept filter follows the kind. */
export function ImmersiveVideoFilePicker({
  onPicked,
}: {
  onPicked: (picked: ImmersiveVideoPickedFile) => void
}) {
  const [kind, setKind] = useState<ImmersiveVideoFileKind>(
    DEFAULT_IMMERSIVE_VIDEO_FILE_KIND,
  )
  const spec = immersiveVideoFileKindSpec(kind)

  return (
    <div className='space-y-2'>
      <ImmersiveVideoFileKindSelect value={kind} onChange={setKind} />
      <p className='text-muted-foreground text-sm'>{spec.hint}</p>
      <Input
        key={kind}
        type='file'
        accept={spec.accept}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onPicked({ file, kind })
        }}
      />
    </div>
  )
}
