'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  getPartnerLogoUploadPrefix,
  PARTNER_LOGO_CATEGORIES,
  PARTNER_LOGO_CATEGORY_LABELS,
} from '@/lib/partner-logos'
import type { PartnerLogoCategory } from '@virtality/shared/types'
import { bucketCdnUrl } from '@virtality/shared/utils'
import {
  useCreatePartnerLogo,
  useUploadBucketObjects,
} from '@virtality/react-query'
import { ImageIcon, Upload } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type AddPartnerLogoDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type SourceMode = 'pick' | 'upload'

const defaultCategory: PartnerLogoCategory = 'strategic'

export const AddPartnerLogoDialog = ({
  open,
  onOpenChange,
}: AddPartnerLogoDialogProps) => {
  const [sourceMode, setSourceMode] = useState<SourceMode>('pick')
  const [objectKey, setObjectKey] = useState('')
  const [alt, setAlt] = useState('')
  const [category, setCategory] = useState<PartnerLogoCategory>(defaultCategory)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [addAnother, setAddAnother] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [pendingObjectKeys, setPendingObjectKeys] = useState<string[]>([])
  const [uploadQueueTotal, setUploadQueueTotal] = useState(0)
  const { mutate: createPartnerLogo, isPending: isSaving } =
    useCreatePartnerLogo()
  const uploadMutation = useUploadBucketObjects()

  const isPending = isSaving || uploadMutation.isPending
  const uploadTargetPrefix = getPartnerLogoUploadPrefix(category)
  const hasPendingAssignments = pendingObjectKeys.length > 0
  const assignmentPosition =
    uploadQueueTotal > 0 ? uploadQueueTotal - pendingObjectKeys.length + 1 : 0

  const resetForm = () => {
    setObjectKey('')
    setAlt('')
    setCategory(defaultCategory)
    setPickerOpen(false)
    setAddAnother(false)
    setSelectedFiles([])
    setPendingObjectKeys([])
    setUploadQueueTotal(0)
    setSourceMode('pick')
    uploadMutation.reset()
  }

  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open])

  const advanceToNextAssignment = () => {
    if (pendingObjectKeys.length > 0) {
      const [nextObjectKey, ...remainingKeys] = pendingObjectKeys
      setObjectKey(nextObjectKey)
      setAlt('')
      setPendingObjectKeys(remainingKeys)
      return true
    }

    return false
  }

  const handleSaveSuccess = () => {
    toast.success('Partner logo assigned.')

    if (advanceToNextAssignment()) {
      return
    }

    if (addAnother) {
      resetForm()
      return
    }

    onOpenChange(false)
  }

  const handleSave = () => {
    const trimmedAlt = alt.trim()

    if (!objectKey) {
      toast.error('Select or upload a bucket image before saving.')
      return
    }

    if (!trimmedAlt) {
      toast.error('Alt text is required.')
      return
    }

    createPartnerLogo(
      {
        objectKey,
        alt: trimmedAlt,
        category,
      },
      {
        onSuccess: handleSaveSuccess,
        onError: (error: unknown) => {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Failed to assign partner logo.',
          )
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
      toast.error('Select at least one image to upload.')
      return
    }

    try {
      const outcome = await uploadMutation.mutateAsync({
        targetPrefix: uploadTargetPrefix,
        files: selectedFiles,
      })

      if (outcome.uploads.length === 0) {
        const firstFailure = outcome.failures[0]
        toast.error(firstFailure?.error ?? 'Upload failed.')
        return
      }

      const uploadedObjectKeys = outcome.uploads.map(
        (upload) => upload.objectKey,
      )
      const [firstObjectKey, ...remainingObjectKeys] = uploadedObjectKeys

      setObjectKey(firstObjectKey)
      setPendingObjectKeys(remainingObjectKeys)
      setUploadQueueTotal(uploadedObjectKeys.length)
      setSelectedFiles([])
      setSourceMode('pick')

      if (outcome.failures.length > 0) {
        toast.warning(
          `${outcome.uploads.length} uploaded, ${outcome.failures.length} failed.`,
        )
      } else {
        toast.success(
          uploadedObjectKeys.length === 1
            ? 'Logo uploaded. Add alt text and save to assign.'
            : `${uploadedObjectKeys.length} logos uploaded. Assign each in turn.`,
        )
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed.')
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Add partner logo</DialogTitle>
            <DialogDescription>
              Pick an existing Bucket Object or upload new images, set alt text,
              and choose whether it appears in the strategic or clinical list.
              Changes go live immediately.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <Tabs
              value={sourceMode}
              onValueChange={(value) => setSourceMode(value as SourceMode)}
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
                <div className='flex items-center gap-3'>
                  <Button
                    type='button'
                    variant='outline'
                    disabled={isPending}
                    onClick={() => setPickerOpen(true)}
                  >
                    <ImageIcon className='mr-2 size-4' />
                    {objectKey ? 'Change image' : 'Select image'}
                  </Button>
                  {objectKey ? (
                    <Image
                      src={bucketCdnUrl(objectKey)}
                      alt={alt || 'Selected logo'}
                      width={64}
                      height={64}
                      className='size-16 rounded object-contain'
                    />
                  ) : null}
                </div>
              </TabsContent>

              <TabsContent value='upload' className='space-y-3'>
                <div className='space-y-2'>
                  <Label htmlFor='partner-logo-upload-files'>Images</Label>
                  <Input
                    id='partner-logo-upload-files'
                    type='file'
                    accept='image/*'
                    multiple
                    disabled={isPending}
                    onChange={handleFileChange}
                  />
                  {selectedFiles.length > 0 ? (
                    <p className='text-muted-foreground text-xs'>
                      {selectedFiles.length} file
                      {selectedFiles.length === 1 ? '' : 's'} selected.
                    </p>
                  ) : null}
                </div>

                <p className='text-muted-foreground text-xs'>
                  Uploads go to{' '}
                  <span className='font-mono'>{uploadTargetPrefix}/</span> based
                  on the selected category.
                </p>

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
                  {selectedFiles.length > 1
                    ? ` ${selectedFiles.length} files`
                    : ''}
                </Button>
              </TabsContent>
            </Tabs>

            {objectKey ? (
              <div className='space-y-2'>
                <p className='text-muted-foreground truncate font-mono text-xs'>
                  {objectKey}
                </p>
                {uploadQueueTotal > 1 ? (
                  <p className='text-muted-foreground text-xs'>
                    Assigning logo {assignmentPosition} of {uploadQueueTotal}.
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className='space-y-2'>
              <label className='text-sm font-medium' htmlFor='partner-logo-alt'>
                Alt text
              </label>
              <Input
                id='partner-logo-alt'
                value={alt}
                disabled={isPending}
                onChange={(event) => setAlt(event.target.value)}
                placeholder='Accessible description of the logo'
              />
            </div>

            <div className='space-y-2'>
              <label
                className='text-sm font-medium'
                htmlFor='partner-logo-category'
              >
                Category
              </label>
              <select
                id='partner-logo-category'
                className='bg-background w-full rounded-md border px-3 py-2 text-sm'
                value={category}
                disabled={isPending}
                onChange={(event) =>
                  setCategory(event.target.value as PartnerLogoCategory)
                }
              >
                {PARTNER_LOGO_CATEGORIES.map((value) => (
                  <option key={value} value={value}>
                    {PARTNER_LOGO_CATEGORY_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className='flex-col gap-3 sm:flex-col sm:items-stretch'>
            <label className='flex items-center gap-2 text-sm'>
              <Checkbox
                checked={addAnother}
                disabled={isPending || hasPendingAssignments}
                onCheckedChange={(checked) => setAddAnother(checked === true)}
              />
              Add another
            </label>
            <div className='flex justify-end gap-2'>
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
                {isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BucketObjectPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={setObjectKey}
      />
    </>
  )
}
