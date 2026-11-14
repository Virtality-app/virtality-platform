'use client'

import type { ProvisionedDeviceListItem } from '@virtality/react-query'
import { Badge } from '@virtality/ui/components/badge'
import { PlusSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { provisionedDeviceStatusLabel } from '@/lib/provisioned-device-display'

type SpareHeadsetListProps = {
  devices: ProvisionedDeviceListItem[]
  /** The headset being attached right now, if any. */
  attachingId: string | undefined
  onAttach: (device: ProvisionedDeviceListItem) => void
  onAdd: () => void
}

/** Headsets in inventory, each with an Attach button. Empty offers Add. */
export function SpareHeadsetList({
  devices,
  attachingId,
  onAttach,
  onAdd,
}: SpareHeadsetListProps) {
  if (devices.length === 0) {
    return (
      <div className='flex flex-col items-center gap-3 py-6 text-center'>
        <p className='text-muted-foreground text-sm'>
          No headsets in inventory. Add a new one to pair it on this code.
        </p>
        <Button
          type='button'
          variant='primary'
          className='flex items-center'
          onClick={onAdd}
        >
          <PlusSquare />
          Add headset
        </Button>
      </div>
    )
  }

  return (
    <ul className='divide-y rounded-md border'>
      {devices.map((device) => (
        <li key={device.id} className='flex items-center gap-3 px-3 py-2'>
          <span className='font-medium'>{device.name}</span>
          <Badge variant={device.paired ? 'secondary' : 'outline'}>
            {provisionedDeviceStatusLabel(device)}
          </Badge>
          <span className='text-muted-foreground min-w-0 flex-1 truncate font-mono text-xs'>
            {device.deviceId ?? ''}
          </span>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => onAttach(device)}
            disabled={attachingId != null}
          >
            {attachingId === device.id ? 'Attaching...' : 'Attach'}
          </Button>
        </li>
      ))}
    </ul>
  )
}
