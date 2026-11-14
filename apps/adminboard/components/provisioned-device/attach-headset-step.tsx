'use client'

import {
  useCreateProvisionedDevice,
  type ProvisionedDeviceListItem,
} from '@virtality/react-query'
import { Headset } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { getErrorMessage } from '@/lib/get-error-message'

type AttachHeadsetStepProps = {
  /** The code that will carry the headset; null adds it to inventory. */
  accessCodeId: number | null
  onCreated: (device: ProvisionedDeviceListItem) => void
  onBack: () => void
}

/** Creates the next `Headset-##`. The dialog then moves on to pairing it. */
export function AttachHeadsetStep({
  accessCodeId,
  onCreated,
  onBack,
}: AttachHeadsetStepProps) {
  const { mutate: create, isPending } = useCreateProvisionedDevice()

  const handleAdd = () =>
    create(
      { accessCodeId },
      {
        onSuccess: onCreated,
        onError: (error) =>
          toast.error(getErrorMessage(error, 'Failed to add headset')),
      },
    )

  return (
    <>
      <div className='flex items-center gap-3 rounded-md border p-4'>
        <Headset className='text-muted-foreground size-8 shrink-0' />
        <p className='text-sm'>
          Have the headset on hand. The next step shows a 6-digit Pairing Code
          to enter on it.
        </p>
      </div>
      <DialogFooter>
        <Button
          type='button'
          variant='outline'
          onClick={onBack}
          disabled={isPending}
        >
          Back
        </Button>
        <Button
          type='button'
          variant='primary'
          onClick={handleAdd}
          disabled={isPending}
        >
          {isPending ? 'Adding...' : 'Add and pair'}
        </Button>
      </DialogFooter>
    </>
  )
}
