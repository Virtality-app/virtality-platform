'use client'

import {
  IMMERSIVE_VIDEO_ID_HINT,
  isValidImmersiveVideoId,
  requestedImmersiveVideoId,
} from '@/lib/immersive-video-file-kind'
import { cn } from '@/lib/utils'
import { Input } from '@virtality/ui/components/input'
import { Label } from '@virtality/ui/components/label'

/** Admin-chosen Video ID, editable only until the first upload verifies. */
export function ImmersiveVideoIdField({
  currentId,
  value,
  editable,
  onChange,
}: {
  currentId: string
  value: string
  editable: boolean
  onChange: (value: string) => void
}) {
  const requested = requestedImmersiveVideoId(value, currentId)
  const invalid = requested != null && !isValidImmersiveVideoId(requested)

  return (
    <div className='space-y-2'>
      <Label htmlFor='immersive-video-id'>Video ID</Label>
      <Input
        id='immersive-video-id'
        value={editable ? value : currentId}
        placeholder={currentId}
        readOnly={!editable}
        aria-invalid={invalid || undefined}
        className={cn('font-mono', !editable && 'text-muted-foreground')}
        onChange={(event) => onChange(event.target.value)}
      />
      <p
        className={cn(
          'text-sm',
          invalid ? 'text-destructive' : 'text-muted-foreground',
        )}
      >
        {editable
          ? IMMERSIVE_VIDEO_ID_HINT
          : 'Fixed: headsets may already hold this video under it.'}
      </p>
    </div>
  )
}
