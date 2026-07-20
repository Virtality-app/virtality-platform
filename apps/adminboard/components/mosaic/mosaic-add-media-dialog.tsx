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
import {
  MosaicMediaPickerDialog,
  type MosaicMediaSelection,
} from '@/components/mosaic/mosaic-media-picker-dialog'
import { formatBucketUploadFileCount } from '@/lib/bucket-upload-display'
import { inferMosaicMediaKindFromContentType } from '@/lib/mosaic-media-picker'
import { getErrorMessage } from '@/lib/get-error-message'
import type { MosaicTrayItem } from '@/lib/mosaic-editor'
import {
  bucketCdnUrl,
  validateBucketTargetPrefix,
} from '@virtality/shared/utils'
import { useUploadBucketObjects } from '@virtality/react-query'
import { Film, ImageIcon, Upload } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

type MosaicAddMediaDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddToTray: (item: MosaicTrayItem) => void
}

type SourceMode = 'pick' | 'upload'

function isSourceMode(value: string): value is SourceMode {
  return value === 'pick' || value === 'upload'
}

function SelectedMediaPreview({
  selection,
  alt,
}: {
  selection: MosaicMediaSelection
  alt: string
}) {
  if (selection.mediaKind === 'image') {
    return (
      <Image
        src={bucketCdnUrl(selection.objectKey)}
        alt={alt || 'Selected media'}
        width={64}
        height={64}
        className='size-16 rounded object-cover'
      />
    )
  }

  return (
    <div className='bg-muted flex size-16 items-center justify-center rounded'>
      <Film className='text-muted-foreground size-8' />
    </div>
  )
}

export const MosaicAddMediaDialog = ({
  open,
  onOpenChange,
  onAddToTray,
}: MosaicAddMediaDialogProps) => {
  const [sourceMode, setSourceMode] = useState<SourceMode>('pick')
  const [selection, setSelection] = useState<MosaicMediaSelection | null>(null)
  const [alt, setAlt] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [targetPrefix, setTargetPrefix] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const uploadMutation = useUploadBucketObjects()
  const isUploadPending = uploadMutation.isPending

  const targetPrefixError = useMemo(
    () => validateBucketTargetPrefix(targetPrefix),
    [targetPrefix],
  )

  const resetForm = () => {
    setSourceMode('pick')
    setSelection(null)
    setAlt('')
    setPickerOpen(false)
    setTargetPrefix('')
    setSelectedFiles([])
    uploadMutation.reset()
  }

  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open])

  const handleAddToTray = () => {
    if (!selection) {
      toast.error('Select or upload bucket media before adding to the tray.')
      return
    }

    const trimmedAlt = alt.trim()
    if (!trimmedAlt) {
      toast.error('Alt text is required.')
      return
    }

    onAddToTray({
      id: crypto.randomUUID(),
      objectKey: selection.objectKey,
      mediaKind: selection.mediaKind,
      alt: trimmedAlt,
    })
    onOpenChange(false)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    setSelectedFiles(files)
    uploadMutation.reset()
  }

  const handleUpload = async () => {
    if (targetPrefixError) {
      toast.error(targetPrefixError)
      return
    }

    if (selectedFiles.length === 0) {
      toast.error('Select at least one media file to upload.')
      return
    }

    try {
      const outcome = await uploadMutation.mutateAsync({
        targetPrefix,
        files: selectedFiles,
      })

      if (outcome.uploads.length === 0) {
        const firstFailure = outcome.failures[0]
        toast.error(firstFailure?.error ?? 'Upload failed.')
        return
      }

      const upload = outcome.uploads[0]
      const mediaKind = inferMosaicMediaKindFromContentType(upload.contentType)

      if (!mediaKind) {
        toast.error('Uploaded file is not a supported mosaic media type.')
        return
      }

      setSelection({
        objectKey: upload.objectKey,
        mediaKind,
      })
      setSelectedFiles([])
      setSourceMode('pick')

      if (outcome.failures.length > 0) {
        toast.warning(
          `${outcome.uploads.length} uploaded, ${outcome.failures.length} failed.`,
        )
      } else {
        toast.success('Media uploaded. Add alt text and move it to the tray.')
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Upload failed.'))
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-lg overflow-hidden'>
          <DialogHeader>
            <DialogTitle>Add media to tray</DialogTitle>
            <DialogDescription>
              Pick an existing Bucket Object or upload media into a folder you
              choose, then add it to the staging tray with required alt text.
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
                <TabsTrigger value='pick' disabled={isUploadPending}>
                  Pick existing
                </TabsTrigger>
                <TabsTrigger value='upload' disabled={isUploadPending}>
                  Upload
                </TabsTrigger>
              </TabsList>

              <TabsContent value='pick' className='space-y-2'>
                <p className='text-sm font-medium'>Bucket Object</p>
                <div className='flex items-center gap-3'>
                  <Button
                    type='button'
                    variant='outline'
                    disabled={isUploadPending}
                    onClick={() => setPickerOpen(true)}
                  >
                    <ImageIcon className='mr-2 size-4' />
                    {selection ? 'Change media' : 'Select media'}
                  </Button>
                  {selection ? (
                    <SelectedMediaPreview selection={selection} alt={alt} />
                  ) : null}
                </div>
              </TabsContent>

              <TabsContent
                value='upload'
                className='flex min-w-0 flex-col gap-3'
              >
                <div className='flex min-w-0 flex-col gap-2'>
                  <Label htmlFor='mosaic-upload-target'>Target folder</Label>
                  <Input
                    id='mosaic-upload-target'
                    value={targetPrefix}
                    disabled={isUploadPending}
                    onChange={(event) => setTargetPrefix(event.target.value)}
                    placeholder='images/campaigns'
                  />
                  <p className='text-muted-foreground text-xs'>
                    Defaults to the bucket root. Upload into any folder you
                    choose; no mosaic-specific prefix is required.
                  </p>
                  {targetPrefixError ? (
                    <p className='text-sm text-red-500'>{targetPrefixError}</p>
                  ) : null}
                </div>

                <div className='flex min-w-0 flex-col gap-2'>
                  <Label htmlFor='mosaic-upload-files'>Media files</Label>
                  <Input
                    id='mosaic-upload-files'
                    type='file'
                    accept='image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,.mov'
                    multiple
                    className='file:text-foreground text-transparent'
                    disabled={isUploadPending}
                    onChange={handleFileChange}
                  />
                  {selectedFiles.length > 0 ? (
                    <p className='text-muted-foreground text-xs'>
                      {formatBucketUploadFileCount(selectedFiles.length)}
                    </p>
                  ) : null}
                </div>

                <Button
                  type='button'
                  variant='outline'
                  disabled={
                    isUploadPending ||
                    selectedFiles.length === 0 ||
                    Boolean(targetPrefixError)
                  }
                  onClick={handleUpload}
                >
                  {isUploadPending ? (
                    <Spinner />
                  ) : (
                    <Upload className='mr-2 size-4' />
                  )}
                  Upload
                </Button>
              </TabsContent>
            </Tabs>

            {selection ? (
              <p
                className='text-muted-foreground truncate font-mono text-xs'
                title={selection.objectKey}
              >
                {selection.objectKey}
              </p>
            ) : null}

            <div className='space-y-2'>
              <Label htmlFor='mosaic-tray-alt'>Alt text</Label>
              <Input
                id='mosaic-tray-alt'
                value={alt}
                disabled={isUploadPending}
                onChange={(event) => setAlt(event.target.value)}
                placeholder='Accessible description of the media'
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              disabled={isUploadPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type='button'
              variant='primary'
              disabled={isUploadPending}
              onClick={handleAddToTray}
            >
              Add to tray
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MosaicMediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={setSelection}
      />
    </>
  )
}
