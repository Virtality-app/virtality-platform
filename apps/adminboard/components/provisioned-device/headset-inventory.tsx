'use client'

import { useProvisionedDevices } from '@virtality/react-query'
import { PlusSquare } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { inventoryDevices } from '@/lib/provisioned-device-display'
import { AttachHeadsetDialog } from './attach-headset-dialog'
import { ProvisionedDeviceList } from './provisioned-device-list'

/**
 * Provisioned Devices with no owner and no Access Code: spares, and
 * headsets detached from a code that expired.
 */
export function HeadsetInventory() {
  const [addOpen, setAddOpen] = useState(false)
  const { data, isPending } = useProvisionedDevices()

  return (
    <div className='flex flex-col gap-4 p-8'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-xl font-semibold'>Headset inventory</h1>
          <p className='text-muted-foreground text-sm'>
            Paired headsets waiting for an Access Code. Use Move to code to send
            one to a customer.
          </p>
        </div>
        <Button
          variant='primary'
          className='flex items-center'
          onClick={() => setAddOpen(true)}
        >
          <PlusSquare />
          Add headset
        </Button>
      </div>
      {isPending ? (
        <p className='text-muted-foreground text-sm'>Loading…</p>
      ) : (
        <ProvisionedDeviceList
          devices={inventoryDevices(data ?? [])}
          emptyMessage='No headsets in inventory.'
        />
      )}
      <AttachHeadsetDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        accessCode={null}
      />
    </div>
  )
}
