'use client'

import type { ProvisionedDeviceListItem } from '@virtality/react-query'
import {
  useDetachProvisionedDevice,
  useRemoveProvisionedDevice,
  useUnpairProvisionedDevice,
} from '@virtality/react-query'
import {
  ArrowRightLeft,
  Ellipsis,
  Link2Off,
  PackageOpen,
  Radio,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDropdownMenu } from '@/hooks/use-dropdown-menu-action'
import { getErrorMessage } from '@/lib/get-error-message'

type ProvisionedDeviceActionsProps = {
  device: ProvisionedDeviceListItem
  onPair: (device: ProvisionedDeviceListItem) => void
  onMove: (device: ProvisionedDeviceListItem) => void
}

/** Staff actions on a Device with no owner. A delivered Device has none. */
export function ProvisionedDeviceActions({
  device,
  onPair,
  onMove,
}: ProvisionedDeviceActionsProps) {
  const { open, setOpen, runAfterClose } = useDropdownMenu()
  const unpair = useUnpairProvisionedDevice()
  const detach = useDetachProvisionedDevice()
  const remove = useRemoveProvisionedDevice()

  if (device.owned) return null

  const input = { deviceRecordId: device.id }
  const feedback = (success: string, failure: string) => ({
    onSuccess: () => toast.success(success),
    onError: (error: Error) => toast.error(getErrorMessage(error, failure)),
  })

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          size='icon'
          variant='ghost'
          className='size-6'
          aria-label={`Actions for ${device.name}`}
        >
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {device.paired ? (
          <DropdownMenuItem
            onSelect={() =>
              unpair.mutate(
                input,
                feedback('Headset unpaired', 'Failed to unpair'),
              )
            }
          >
            <Link2Off />
            Unpair
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onSelect={() => runAfterClose(() => onPair(device))}
          >
            <Radio />
            Pair headset
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => runAfterClose(() => onMove(device))}>
          <ArrowRightLeft />
          Move to code
        </DropdownMenuItem>
        {device.accessCodeId != null ? (
          <DropdownMenuItem
            onSelect={() =>
              detach.mutate(
                input,
                feedback('Moved to inventory', 'Failed to detach'),
              )
            }
          >
            <PackageOpen />
            Detach to inventory
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          onSelect={() =>
            remove.mutate(input, feedback('Device removed', 'Failed to remove'))
          }
        >
          <Trash2 />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
