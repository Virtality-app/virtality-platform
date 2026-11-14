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
import { useState } from 'react'
import { provisionedDeviceStatusLabel } from '@/lib/provisioned-device-display'
import { MoveHeadsetDialog } from './move-headset-dialog'
import { PairHeadsetDialog } from './pair-headset-dialog'
import { ProvisionedDeviceActions } from './provisioned-device-actions'

type ProvisionedDeviceListProps = {
  devices: ProvisionedDeviceListItem[]
  emptyMessage: string
}

export function ProvisionedDeviceList({
  devices,
  emptyMessage,
}: ProvisionedDeviceListProps) {
  const [pairing, setPairing] = useState<ProvisionedDeviceListItem | null>(null)
  const [moving, setMoving] = useState<ProvisionedDeviceListItem | null>(null)

  if (devices.length === 0) {
    return (
      <p className='text-muted-foreground py-6 text-center text-sm'>
        {emptyMessage}
      </p>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Headset</TableHead>
            <TableHead className='w-8' />
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => (
            <TableRow key={device.id}>
              <TableCell className='font-medium'>{device.name}</TableCell>
              <TableCell>{device.model ?? '—'}</TableCell>
              <TableCell>
                <Badge variant={device.paired ? 'secondary' : 'outline'}>
                  {provisionedDeviceStatusLabel(device)}
                </Badge>
              </TableCell>
              <TableCell className='font-mono text-xs'>
                {device.deviceId ?? '—'}
              </TableCell>
              <TableCell>
                <ProvisionedDeviceActions
                  device={device}
                  onPair={setPairing}
                  onMove={setMoving}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <PairHeadsetDialog
        device={pairing}
        onOpenChange={(open) => !open && setPairing(null)}
      />
      <MoveHeadsetDialog
        device={moving}
        onOpenChange={(open) => !open && setMoving(null)}
      />
    </>
  )
}
