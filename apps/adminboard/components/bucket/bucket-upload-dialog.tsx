'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@virtality/ui/components/label'
import { Input } from '@virtality/ui/components/input'
import { Spinner } from '@virtality/ui/components/spinner'
import { useUploadBucketObjects } from '@virtality/react-query'
import {
  normalizeBucketPrefix,
  validateBucketTargetPrefix,
  type BucketUploadResultItem,
} from '@virtality/shared/utils'
import {
  formatBucketUploadFileCount,
  getBucketUploadSelectedFileNames,
} from '@/lib/bucket-upload-display'
import { Copy, Upload } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type BucketUploadDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPrefix: string
  onUploaded?: (uploads: BucketUploadResultItem[]) => void
}

function UploadResultRow({ upload }: { upload: BucketUploadResultItem }) {
  const copyCdnUrl = () => {
    void navigator.clipboard.writeText(upload.cdnUrl)
  }

  return (
    <div className='flex items-start justify-between gap-3 rounded-md border border-zinc-200 p-3 dark:border-zinc-800'>
      <div className='min-w-0 flex-1'>
        <p className='truncate font-medium' title={upload.filename}>
          {upload.filename}
        </p>
        <p
          className='truncate font-mono text-xs text-zinc-500'
          title={upload.objectKey}
        >
          {upload.objectKey}
        </p>
      </div>
      <Button
        size='sm'
        variant='outline'
        className='shrink-0'
        onClick={copyCdnUrl}
      >
        <Copy />
        Copy CDN URL
      </Button>
    </div>
  )
}

export function BucketUploadDialog({
  open,
  onOpenChange,
  currentPrefix,
  onUploaded,
}: BucketUploadDialogProps) {
  const [targetPrefix, setTargetPrefix] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [validationError, setValidationError] = useState<string | null>(null)
  const [uploadResults, setUploadResults] = useState<BucketUploadResultItem[]>(
    [],
  )
  const [uploadFailures, setUploadFailures] = useState<
    { filename: string; error: string }[]
  >([])

  const uploadMutation = useUploadBucketObjects({
    onSuccess: (outcome) => {
      setUploadResults(outcome.uploads)
      setUploadFailures(outcome.failures)
      onUploaded?.(outcome.uploads)
    },
  })

  useEffect(() => {
    if (!open) {
      return
    }

    setTargetPrefix(normalizeBucketPrefix(currentPrefix).replace(/\/$/, ''))
    setSelectedFiles([])
    setValidationError(null)
    setUploadResults([])
    setUploadFailures([])
  }, [currentPrefix, open])

  const targetPrefixError = useMemo(() => {
    return validateBucketTargetPrefix(targetPrefix)
  }, [targetPrefix])

  const canSubmit =
    selectedFiles.length > 0 &&
    !targetPrefixError &&
    !uploadMutation.isPending &&
    uploadResults.length === 0

  const selectedFileNames = useMemo(
    () => getBucketUploadSelectedFileNames(selectedFiles),
    [selectedFiles],
  )

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    setSelectedFiles(files)
    setValidationError(null)
    setUploadResults([])
    setUploadFailures([])
    uploadMutation.reset()
  }

  const handleUpload = async () => {
    if (targetPrefixError) {
      setValidationError(targetPrefixError)
      return
    }

    if (selectedFiles.length === 0) {
      setValidationError('Select at least one file to upload.')
      return
    }

    setValidationError(null)

    try {
      await uploadMutation.mutateAsync({
        targetPrefix,
        files: selectedFiles,
      })
    } catch (error) {
      setValidationError(
        error instanceof Error ? error.message : 'Upload failed.',
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='overflow-hidden sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>Upload bucket objects</DialogTitle>
        </DialogHeader>

        <div className='flex min-w-0 flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='bucket-upload-target'>Target folder</Label>
            <Input
              id='bucket-upload-target'
              value={targetPrefix}
              onChange={(event) => setTargetPrefix(event.target.value)}
              placeholder='images/thumbs'
              disabled={uploadMutation.isPending || uploadResults.length > 0}
            />
            <p className='text-xs text-zinc-500'>
              Defaults to the current folder. Uploading into a new path creates
              that prefix once objects exist there.
            </p>
            {targetPrefixError ? (
              <p className='text-sm text-red-500'>{targetPrefixError}</p>
            ) : null}
          </div>

          <div className='flex min-w-0 flex-col gap-2'>
            <Label htmlFor='bucket-upload-files'>Files</Label>
            <Input
              id='bucket-upload-files'
              type='file'
              multiple
              className='file:text-foreground text-transparent'
              onChange={handleFileChange}
              disabled={uploadMutation.isPending || uploadResults.length > 0}
            />
            {selectedFiles.length > 0 ? (
              <div className='flex min-w-0 flex-col gap-1'>
                <p className='text-xs text-zinc-500'>
                  {formatBucketUploadFileCount(selectedFiles.length)}
                </p>
                <ul className='flex max-h-32 min-w-0 flex-col gap-1 overflow-y-auto'>
                  {selectedFileNames.map((filename) => (
                    <li
                      key={filename}
                      data-testid='bucket-upload-selected-file'
                      className='truncate text-xs text-zinc-600 dark:text-zinc-300'
                      title={filename}
                    >
                      {filename}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {validationError ? (
            <p className='text-sm text-red-500'>{validationError}</p>
          ) : null}

          {uploadResults.length > 0 ? (
            <div className='flex flex-col gap-2'>
              <p className='text-sm font-medium'>Uploaded objects</p>
              {uploadResults.map((upload) => (
                <UploadResultRow key={upload.objectKey} upload={upload} />
              ))}
            </div>
          ) : null}

          {uploadFailures.length > 0 ? (
            <div className='flex flex-col gap-2'>
              <p className='text-sm font-medium text-red-500'>Failed uploads</p>
              {uploadFailures.map((failure) => (
                <p
                  key={failure.filename}
                  className='truncate text-sm text-red-500'
                  title={`${failure.filename}: ${failure.error}`}
                >
                  {failure.filename}: {failure.error}
                </p>
              ))}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={uploadMutation.isPending}
          >
            {uploadResults.length > 0 ? 'Close' : 'Cancel'}
          </Button>
          {uploadResults.length === 0 ? (
            <Button onClick={handleUpload} disabled={!canSubmit}>
              {uploadMutation.isPending ? <Spinner /> : <Upload />}
              Upload
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
