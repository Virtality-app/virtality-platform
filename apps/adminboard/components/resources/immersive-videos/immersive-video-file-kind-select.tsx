'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  immersiveVideoFileKindSpec,
  IMMERSIVE_VIDEO_FILE_KINDS,
  type ImmersiveVideoFileKind,
} from '@/lib/immersive-video-file-kind'
import { Label } from '@virtality/ui/components/label'

export function ImmersiveVideoFileKindSelect({
  value,
  onChange,
}: {
  value: ImmersiveVideoFileKind
  onChange: (kind: ImmersiveVideoFileKind) => void
}) {
  return (
    <div className='space-y-2'>
      <Label>File kind</Label>
      <Select
        value={value}
        onValueChange={(next) => onChange(next as ImmersiveVideoFileKind)}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {IMMERSIVE_VIDEO_FILE_KINDS.map((kind) => (
            <SelectItem key={kind} value={kind}>
              {immersiveVideoFileKindSpec(kind).label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
