'use client'

import {
  useMoveProvisionedDevice,
  useProvisionedDevices,
  type ProvisionedDeviceListItem,
} from '@virtality/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { getErrorMessage } from '@/lib/get-error-message'
import { inventoryDevices } from '@/lib/provisioned-device-display'
import { SpareHeadsetList } from './spare-headset-list'

type AttachHeadsetStepProps = {
  accessCodeId: number
  /** The headset is on the code now, under its new name. */
  onAttached: (device: ProvisionedDeviceListItem) => void
  /** No spares: add a new headset instead. */
  onAdd: () => void
  onBack: () => void
}

/** Picks a spare from inventory and moves it onto the code. */
export function AttachHeadsetStep({
  accessCodeId,
  onAttached,
  onAdd,
  onBack,
}: AttachHeadsetStepProps) {
  const { data, isPending: loading } = useProvisionedDevices()
  const { mutate: move, isPending, variables } = useMoveProvisionedDevice()
  const spares = inventoryDevices(data ?? [])

  const handleAttach = (device: ProvisionedDeviceListItem) =>
    move(
      { deviceRecordId: device.id, accessCodeId },
      {
        // Headsets are numbered per code, so attaching can rename it.
        onSuccess: ({ name }) => {
          toast.success(
            name === device.name
              ? `${device.name} attached`
              : `${device.name} attached as ${name}`,
          )
          onAttached({ ...device, name, accessCodeId })
        },
        onError: (error) =>
          toast.error(getErrorMessage(error, 'Failed to attach headset')),
      },
    )

  return (
    <>
      {loading ? (
        <p className='text-muted-foreground py-6 text-center text-sm'>
          Loading…
        </p>
      ) : (
        <SpareHeadsetList
          devices={spares}
          attachingId={isPending ? variables?.deviceRecordId : undefined}
          onAttach={handleAttach}
          onAdd={onAdd}
        />
      )}
      <DialogFooter>
        <Button
          type='button'
          variant='outline'
          onClick={onBack}
          disabled={isPending}
        >
          Back
        </Button>
      </DialogFooter>
    </>
  )
}
