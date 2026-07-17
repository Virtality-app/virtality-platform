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
import { Label } from '@virtality/ui/components/label'
import { BucketObjectPickerDialog } from '@/components/email/bucket-object-picker-dialog'
import {
  DEFAULT_PARTNER_LOGO_CATEGORY,
  isPartnerLogoCategory,
  PARTNER_LOGO_CATEGORIES,
  PARTNER_LOGO_CATEGORY_LABELS,
} from '@/lib/partner-logos'
import { getErrorMessage } from '@/lib/get-error-message'
import type {
  PartnerLogoCategory,
  PartnerLogoListItem,
} from '@virtality/shared/types'
import { bucketCdnUrl } from '@virtality/shared/utils'
import { useUpdatePartnerLogo } from '@virtality/react-query'
import { ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type EditPartnerLogoDialogProps = {
  logo: PartnerLogoListItem | null
  onClose: () => void
}

export const EditPartnerLogoDialog = ({
  logo,
  onClose,
}: EditPartnerLogoDialogProps) => {
  const [objectKey, setObjectKey] = useState('')
  const [alt, setAlt] = useState('')
  const [category, setCategory] = useState<PartnerLogoCategory>(
    DEFAULT_PARTNER_LOGO_CATEGORY,
  )
  const [pickerOpen, setPickerOpen] = useState(false)
  const { mutate: updatePartnerLogo, isPending } = useUpdatePartnerLogo()

  useEffect(() => {
    if (!logo) {
      return
    }

    setObjectKey(logo.objectKey)
    setAlt(logo.alt)
    setCategory(logo.category)
    setPickerOpen(false)
  }, [logo])

  const handleSave = () => {
    if (!logo) {
      return
    }

    const trimmedAlt = alt.trim()

    if (!objectKey) {
      toast.error('Select a bucket image before saving.')
      return
    }

    if (!trimmedAlt) {
      toast.error('Alt text is required.')
      return
    }

    updatePartnerLogo(
      {
        id: logo.id,
        objectKey,
        alt: trimmedAlt,
        category,
      },
      {
        onSuccess: () => {
          toast.success('Partner logo updated.')
          onClose()
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error, 'Failed to update partner logo.'))
        },
      },
    )
  }

  return (
    <>
      <Dialog
        open={logo !== null}
        onOpenChange={(open) => {
          if (!open) {
            onClose()
          }
        }}
      >
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Edit partner logo</DialogTitle>
            <DialogDescription>
              Change the Bucket Object, alt text, or category. Category changes
              move the logo to the end of the destination list. Changes go live
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
                  Change image
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
              <Label htmlFor='edit-partner-logo-alt'>Alt text</Label>
              <Input
                id='edit-partner-logo-alt'
                value={alt}
                disabled={isPending}
                onChange={(event) => setAlt(event.target.value)}
                placeholder='Accessible description of the logo'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='edit-partner-logo-category'>Category</Label>
              <select
                id='edit-partner-logo-category'
                className='bg-background w-full rounded-md border px-3 py-2 text-sm'
                value={category}
                disabled={isPending}
                onChange={(event) => {
                  const value = event.target.value
                  if (isPartnerLogoCategory(value)) {
                    setCategory(value)
                  }
                }}
              >
                {PARTNER_LOGO_CATEGORIES.map((value) => (
                  <option key={value} value={value}>
                    {PARTNER_LOGO_CATEGORY_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className='gap-2 sm:justify-end'>
            <Button
              type='button'
              variant='outline'
              disabled={isPending}
              onClick={onClose}
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
