'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@virtality/ui/components/input'
import { Label } from '@virtality/ui/components/label'
import { Spinner } from '@virtality/ui/components/spinner'
import { BucketObjectPickerDialog } from '@/components/email/bucket-object-picker-dialog'
import { PROMO_VIDEO_UPLOAD_PREFIX } from '@/lib/promo-video'
import { getErrorMessage } from '@/lib/get-error-message'
import {
  useAssignPromoVideo,
  useUploadBucketObjects,
} from '@virtality/react-query'
import { Film, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type AssignPromoVideoDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type SourceMode = 'pick' | 'upload'

function isSourceMode(value: string): value is SourceMode {
  return value === 'pick' || value === 'upload'
}

export const AssignPromoVideoDialog = ({
  open,
  onOpenChange,
}: AssignPromoVideoDialogProps) => {
  const [sourceMode, setSourceMode] = useState<SourceMode>('pick')
  const [objectKey, setObjectKey] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const { mutate: assignPromoVideo, isPending: isSaving } =
    useAssignPromoVideo()
  const uploadMutation = useUploadBucketObjects()

  const isPending = isSaving || uploadMutation.isPending

  const resetForm = () => {
    setObjectKey('')
    setPickerOpen(false)
    setSelectedFiles([])
    setSourceMode('pick')
    uploadMutation.reset()
  }

  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open])

  const handleSave = () => {
    if (!objectKey) {
      toast.error('Select or upload an MP4 before saving.')
      return
    }

    assignPromoVideo(
      { objectKey },
      {
        onSuccess: () => {
          toast.success('Promo video assigned.')
          onOpenChange(false)
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error, 'Failed to assign promo video.'))
        },
      },
    )
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    setSelectedFiles(files)
    uploadMutation.reset()
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Select an MP4 file to upload.')
      return
    }

    try {
      const outcome = await uploadMutation.mutateAsync({
        targetPrefix: PROMO_VIDEO_UPLOAD_PREFIX,
        files: selectedFiles,
      })

      if (outcome.uploads.length === 0) {
        const firstFailure = outcome.failures[0]
        toast.error(firstFailure?.error ?? 'Upload failed.')
        return
      }

      const uploaded = outcome.uploads[0]
      setObjectKey(uploaded.objectKey)
      setSelectedFiles([])
      setSourceMode('pick')
      toast.success('Video uploaded. Save to assign it to the landing page.')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Upload failed.'))
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-lg overflow-hidden'>
          <DialogHeader>
            <DialogTitle>Assign promo video</DialogTitle>
            <DialogDescription>
              Pick an existing MP4 from the bucket or upload a new one under{' '}
              <span className='font-mono'>{PROMO_VIDEO_UPLOAD_PREFIX}/</span>.
              Changes go live immediately on the landing page.
            </DialogDescription>
          </DialogHeader>

          <div className='flex min-w-0 flex-col gap-4'>
            <Tabs
              value={sourceMode}
              onValueChange={(value) => {
                if (isSourceMode(value)) {
                  setSourceMode(value)
                }
              }}
            >
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='pick' disabled={isPending}>
                  Pick existing
                </TabsTrigger>
                <TabsTrigger value='upload' disabled={isPending}>
                  Upload
                </TabsTrigger>
              </TabsList>

              <TabsContent value='pick' className='space-y-2'>
                <p className='text-sm font-medium'>Bucket Object</p>
                <Button
                  type='button'
                  variant='outline'
                  disabled={isPending}
                  onClick={() => setPickerOpen(true)}
                >
                  <Film className='mr-2 size-4' />
                  {objectKey ? 'Change video' : 'Select MP4'}
                </Button>
              </TabsContent>

              <TabsContent
                value='upload'
                className='flex min-w-0 flex-col gap-3'
              >
                <div className='flex min-w-0 flex-col gap-2'>
                  <Label htmlFor='promo-video-upload-file'>MP4 video</Label>
                  <Input
                    id='promo-video-upload-file'
                    type='file'
                    accept='video/mp4,.mp4'
                    className='file:text-foreground text-transparent'
                    disabled={isPending}
                    onChange={handleFileChange}
                  />
                  {selectedFiles[0] ? (
                    <p
                      className='text-muted-foreground truncate text-xs'
                      title={selectedFiles[0].name}
                    >
                      {selectedFiles[0].name}
                    </p>
                  ) : null}
                </div>

                <Button
                  type='button'
                  variant='outline'
                  disabled={isPending || selectedFiles.length === 0}
                  onClick={handleUpload}
                >
                  {uploadMutation.isPending ? (
                    <Spinner />
                  ) : (
                    <Upload className='mr-2 size-4' />
                  )}
                  Upload
                </Button>
              </TabsContent>
            </Tabs>

            {objectKey ? (
              <p
                className='text-muted-foreground truncate font-mono text-xs'
                title={objectKey}
              >
                {objectKey}
              </p>
            ) : null}
          </div>

          <DialogFooter className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type='button'
              variant='primary'
              disabled={isPending}
              onClick={handleSave}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BucketObjectPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={setObjectKey}
        objectKind='mp4'
      />
    </>
  )
}
