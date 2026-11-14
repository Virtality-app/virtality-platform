'use client'

import { Input } from '@virtality/ui/components/input'
import { Label } from '@virtality/ui/components/label'
import { useCreateProvisionedDevice } from '@virtality/react-query'
import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getErrorMessage } from '@/lib/get-error-message'
import { PairingCodePanel } from './pairing-code-panel'

type AttachHeadsetDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The code that will carry the headset; null adds it to inventory. */
  accessCode: { id: number; code: string } | null
}

/**
 * Creates a Provisioned Device, then shows its live Pairing Code so staff
 * can pair the headset before it ships.
 */
export function AttachHeadsetDialog({
  open,
  onOpenChange,
  accessCode,
}: AttachHeadsetDialogProps) {
  const [name, setName] = useState('')
  const [model, setModel] = useState('')
  const [createdId, setCreatedId] = useState<string | null>(null)
  const { mutate: create, isPending } = useCreateProvisionedDevice()

  useEffect(() => {
    if (open) return
    setName('')
    setModel('')
    setCreatedId(null)
  }, [open])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    create(
      {
        name: name.trim(),
        model: model.trim() || null,
        accessCodeId: accessCode?.id ?? null,
      },
      {
        onSuccess: (device) => setCreatedId(device.id),
        onError: (error) =>
          toast.error(getErrorMessage(error, 'Failed to add headset')),
      },
    )
  }

  const target = accessCode ? accessCode.code : 'inventory'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {accessCode ? 'Attach headset' : 'Add headset to inventory'}
          </DialogTitle>
          <DialogDescription>
            {createdId
              ? 'Put the headset on, open pairing and enter this code.'
              : `Creates a Device with no owner on ${target}. Whoever redeems the code owns it.`}
          </DialogDescription>
        </DialogHeader>
        {createdId ? (
          <>
            <PairingCodePanel deviceRecordId={createdId} />
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className='grid gap-4 py-4'>
              <div className='grid gap-2'>
                <Label htmlFor='headset-name'>Name</Label>
                <Input
                  id='headset-name'
                  required
                  maxLength={100}
                  placeholder='Clinic headset 1'
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='headset-model'>Model (optional)</Label>
                <Input
                  id='headset-model'
                  maxLength={100}
                  placeholder='Quest 3'
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                />
              </div>
            </div>
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
                type='submit'
                variant='primary'
                disabled={isPending || !name.trim()}
              >
                {isPending ? 'Adding...' : 'Add and pair'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
