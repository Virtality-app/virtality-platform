'use client'

import { ImmersiveVideoFileSection } from '@/components/resources/immersive-videos/immersive-video-file-section'
import type { ImmersiveVideoFileRequest } from '@/components/resources/immersive-videos/immersive-video-file-section'
import { ImmersiveVideoThumbnailSection } from '@/components/resources/immersive-videos/immersive-video-thumbnail-section'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getErrorMessage } from '@/lib/get-error-message'
import type { ImmersiveVideoAdminRow } from '@/lib/immersive-video-admin-row'
import { publishPreconditionLabel } from '@/lib/immersive-video-admin-row'
import type { ImmersiveVideoUploadController } from '@/hooks/use-immersive-video-upload'
import {
  usePublishImmersiveVideo,
  useUpdateImmersiveVideo,
} from '@virtality/react-query'
import { Input } from '@virtality/ui/components/input'
import { Label } from '@virtality/ui/components/label'
import { Textarea } from '@virtality/ui/components/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@virtality/ui/components/tooltip'
import type { ExerciseThumbnailVideoSource } from '@/lib/exercise-wizard-thumbnail'
import { immersiveVideoFileKindOf } from '@/lib/immersive-video-file-kind'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

export function ImmersiveVideoDialog({
  open,
  row,
  pendingFile,
  upload,
  onOpenChange,
  onFile,
}: {
  open: boolean
  row: ImmersiveVideoAdminRow | null
  pendingFile: File | null
  upload: ImmersiveVideoUploadController
  onOpenChange: (open: boolean) => void
  onFile: (request: ImmersiveVideoFileRequest) => void
}) {
  const update = useUpdateImmersiveVideo()
  const publish = usePublishImmersiveVideo()
  const [title, setTitle] = useState('')
  const [activity, setActivity] = useState<'CYCLING' | 'WALKING'>('CYCLING')
  const [description, setDescription] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!row) return
    setTitle(row.title)
    setActivity(row.activity)
    setDescription(row.description ?? '')
  }, [row?.id, row?.title, row?.activity, row?.description])

  // Bundles are opaque to the browser: no frame can be grabbed from them, so
  // the thumbnail can only be an uploaded image. The row's stored filename
  // decides when no file is pending.
  const fileKind = immersiveVideoFileKindOf(
    pendingFile?.name ?? row?.filename ?? '',
  )
  const videoSource: ExerciseThumbnailVideoSource | null =
    pendingFile && fileKind === 'video'
      ? { kind: 'file', file: pendingFile }
      : null

  const scheduleSave = (patch: {
    title?: string
    activity?: 'CYCLING' | 'WALKING'
    description?: string
  }) => {
    if (!row) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      update.mutate(
        { id: row.id, ...patch },
        {
          onError: (error) =>
            toast.error(getErrorMessage(error, 'Failed to save')),
        },
      )
    }, 500)
  }

  const precondition = row
    ? publishPreconditionLabel(row)
    : 'Upload a file to publish'
  const canPublish =
    row &&
    (row.state === 'Draft' || row.state === 'Unpublished') &&
    !precondition

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>
            {row?.title.trim() ? row.title : 'Immersive Video'}
          </DialogTitle>
        </DialogHeader>
        {row ? (
          <div className='space-y-4'>
            {row.verifyFailedAt ? (
              <p className='text-destructive text-sm'>
                The uploaded file failed verification. Upload it again.
              </p>
            ) : null}
            <div className='space-y-2'>
              <Label htmlFor='immersive-video-title'>Title</Label>
              <Input
                id='immersive-video-title'
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value)
                  scheduleSave({ title: event.target.value })
                }}
              />
            </div>
            <div className='space-y-2'>
              <Label>Activity</Label>
              <Select
                value={activity}
                onValueChange={(value) => {
                  const next = value as 'CYCLING' | 'WALKING'
                  setActivity(next)
                  scheduleSave({ activity: next })
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='CYCLING'>Cycling</SelectItem>
                  <SelectItem value='WALKING'>Walking</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='immersive-video-description'>Description</Label>
              <Textarea
                id='immersive-video-description'
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value)
                  scheduleSave({ description: event.target.value })
                }}
              />
            </div>
            <ImmersiveVideoThumbnailSection
              videoId={row.id}
              thumbnailUrl={row.thumbnailUrl}
              videoSource={videoSource}
              imageOnly={fileKind === 'bundle'}
            />
            <ImmersiveVideoFileSection
              row={row}
              upload={upload}
              onPickedFile={onFile}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      type='button'
                      disabled={!canPublish || publish.isPending}
                      onClick={() =>
                        publish.mutate(
                          { id: row.id },
                          {
                            onError: (error) =>
                              toast.error(
                                getErrorMessage(error, 'Failed to publish'),
                              ),
                          },
                        )
                      }
                    >
                      Publish
                    </Button>
                  </span>
                </TooltipTrigger>
                {precondition ? (
                  <TooltipContent>{precondition}</TooltipContent>
                ) : null}
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
