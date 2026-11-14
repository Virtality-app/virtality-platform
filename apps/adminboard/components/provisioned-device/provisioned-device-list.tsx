'use client'

import type { ProvisionedDeviceListItem } from '@virtality/react-query'
import { Badge } from '@virtality/ui/components/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@virtality/ui/components/table'
import { provisionedDeviceStatusLabel } from '@/lib/provisioned-device-display'
import { AccessCodeLink } from './access-code-link'
import { DeviceOwnerLink } from './device-owner-link'
import { ProvisionedDeviceActions } from './provisioned-device-actions'

type ProvisionedDeviceListProps = {
  devices: ProvisionedDeviceListItem[]
  emptyMessage: string
  onPair: (device: ProvisionedDeviceListItem) => void
  onMove: (device: ProvisionedDeviceListItem) => void
  /**
   * The list is inside one code's headsets dialog: the code column is
   * left out, and the actions menu is modal (see ProvisionedDeviceActions).
   */
  inDialog?: boolean
}

export function ProvisionedDeviceList({
  devices,
  emptyMessage,
  onPair,
  onMove,
  inDialog = false,
}: ProvisionedDeviceListProps) {
  if (devices.length === 0) {
    return (
      <p className='text-muted-foreground py-6 text-center text-sm'>
        {emptyMessage}
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          {inDialog ? null : <TableHead>Access Code</TableHead>}
          <TableHead>Customer</TableHead>
          <TableHead>Headset</TableHead>
          <TableHead className='w-8' />
        </TableRow>
      </TableHeader>
      <TableBody>
        {devices.map((device) => (
          <TableRow key={device.id}>
            <TableCell className='font-medium'>{device.name}</TableCell>
            <TableCell>
              <Badge variant={device.paired ? 'secondary' : 'outline'}>
                {provisionedDeviceStatusLabel(device)}
              </Badge>
            </TableCell>
            {inDialog ? null : (
              <TableCell>
                <AccessCodeLink code={device.accessCode} />
              </TableCell>
            )}
            <TableCell>
              <DeviceOwnerLink owner={device.owner} />
            </TableCell>
            <TableCell className='font-mono text-xs'>
              {device.deviceId ?? '—'}
            </TableCell>
            <TableCell>
              <ProvisionedDeviceActions
                device={device}
                onPair={onPair}
                onMove={onMove}
                inDialog={inDialog}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
