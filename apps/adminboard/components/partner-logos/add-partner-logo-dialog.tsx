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
import { Input } from '@virtality/ui/components/input'
import { BucketObjectPickerDialog } from '@/components/email/bucket-object-picker-dialog'
import {
  PARTNER_LOGO_CATEGORIES,
  PARTNER_LOGO_CATEGORY_LABELS,
} from '@/lib/partner-logos'
import type { PartnerLogoCategory } from '@virtality/shared/types'
import { bucketCdnUrl } from '@virtality/shared/utils'
import { useCreatePartnerLogo } from '@virtality/react-query'
import { ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type AddPartnerLogoDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const defaultCategory: PartnerLogoCategory = 'strategic'

export const AddPartnerLogoDialog = ({
  open,
  onOpenChange,
}: AddPartnerLogoDialogProps) => {
  const [objectKey, setObjectKey] = useState('')
  const [alt, setAlt] = useState('')
  const [category, setCategory] = useState<PartnerLogoCategory>(defaultCategory)
  const [pickerOpen, setPickerOpen] = useState(false)
  const { mutate: createPartnerLogo, isPending } = useCreatePartnerLogo()

  const resetForm = () => {
    setObjectKey('')
    setAlt('')
    setCategory(defaultCategory)
    setPickerOpen(false)
  }

  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open])

  const handleSave = () => {
    const trimmedAlt = alt.trim()

    if (!objectKey) {
      toast.error('Select a bucket image before saving.')
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
        onSuccess: () => {
          toast.success('Partner logo assigned.')
          onOpenChange(false)
        },
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Add partner logo</DialogTitle>
            <DialogDescription>
              Pick an existing Bucket Object, set alt text, and choose whether
              it appears in the strategic or clinical list. Changes go live
              immediately.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='space-y-2'>
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
              {objectKey ? (
                <p className='text-muted-foreground truncate font-mono text-xs'>
                  {objectKey}
                </p>
              ) : null}
            </div>

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

          <DialogFooter>
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
