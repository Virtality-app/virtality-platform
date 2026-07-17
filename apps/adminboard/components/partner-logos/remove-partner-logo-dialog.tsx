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
import { Spinner } from '@virtality/ui/components/spinner'
import type { PartnerLogoListItem } from '@virtality/shared/types'
import { useRemovePartnerLogo } from '@virtality/react-query'
import { useEffect, useState } from 'react'

type RemovePartnerLogoDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  logo: PartnerLogoListItem | null
}

function getRemoveButtonLabel(
  alsoDeleteBucketObject: boolean,
  requiresObjectDeleteConfirm: boolean,
): string {
  if (requiresObjectDeleteConfirm) {
    return 'Delete Bucket Object'
  }

  if (alsoDeleteBucketObject) {
    return 'Remove and delete object'
  }

  return 'Remove assignment'
}

export function RemovePartnerLogoDialog({
  open,
  onOpenChange,
  logo,
}: RemovePartnerLogoDialogProps) {
  const [alsoDeleteBucketObject, setAlsoDeleteBucketObject] = useState(false)
  const [confirmObjectDelete, setConfirmObjectDelete] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const {
    mutateAsync: removePartnerLogo,
    isPending,
    reset,
  } = useRemovePartnerLogo()

  useEffect(() => {
    if (!open) {
      return
    }

    setAlsoDeleteBucketObject(false)
    setConfirmObjectDelete(false)
    setValidationError(null)
    reset()
  }, [logo, open, reset])

  const handleRemove = async () => {
    if (!logo) {
      return
    }

    if (alsoDeleteBucketObject && !confirmObjectDelete) {
      setConfirmObjectDelete(true)
      return
    }

    setValidationError(null)

    try {
      await removePartnerLogo({
        id: logo.id,
        alsoDeleteBucketObject,
      })
      onOpenChange(false)
    } catch (error) {
      setValidationError(
        error instanceof Error ? error.message : 'Remove failed.',
      )
    }
  }

  const requiresObjectDeleteConfirm =
    alsoDeleteBucketObject && !confirmObjectDelete

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Remove partner logo</DialogTitle>
          <DialogDescription>
            Remove this logo assignment from the website Supported by section.
            The Bucket Object stays in storage unless you choose to delete it.
          </DialogDescription>
        </DialogHeader>

        {logo ? (
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-1'>
              <p className='text-sm font-medium'>{logo.alt}</p>
              <p className='font-mono text-xs text-zinc-500'>
                {logo.objectKey}
              </p>
            </div>

            <label className='flex items-start gap-3 text-sm'>
              <Checkbox
                checked={alsoDeleteBucketObject}
                onCheckedChange={(checked) => {
                  setAlsoDeleteBucketObject(checked === true)
                  setConfirmObjectDelete(false)
                }}
                disabled={isPending}
              />
              <span>
                Also delete the Bucket Object from storage after removing the
                assignment
              </span>
            </label>

            {requiresObjectDeleteConfirm ? (
              <p className='text-sm text-amber-700 dark:text-amber-300'>
                Confirm to permanently delete this Bucket Object from storage.
                This action cannot be undone.
              </p>
            ) : null}

            {validationError ? (
              <p className='text-sm text-red-500'>{validationError}</p>
            ) : null}
          </div>
        ) : null}

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type='button'
            variant='destructive'
            onClick={handleRemove}
            disabled={!logo || isPending}
          >
            {isPending ? (
              <Spinner />
            ) : (
              getRemoveButtonLabel(
                alsoDeleteBucketObject,
                requiresObjectDeleteConfirm,
              )
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
