'use client'

import {
  useCreateProvisionedDevice,
  type ProvisionedDeviceListItem,
} from '@virtality/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { getErrorMessage } from '@/lib/get-error-message'

type AddHeadsetStepProps = {
  /** The code that will carry the headset; null adds it to inventory. */
  accessCodeId: number | null
  onCreated: (device: ProvisionedDeviceListItem) => void
  onBack: () => void
}

/**
 * Creates the next `Headset-##`. The dialog then moves on to pairing it.
 * The title's info icon explains what to have ready.
 */
export function AddHeadsetStep({
  accessCodeId,
  onCreated,
  onBack,
}: AddHeadsetStepProps) {
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
  )
}
