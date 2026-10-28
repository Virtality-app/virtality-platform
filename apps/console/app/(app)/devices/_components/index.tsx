'use client'
import { Button } from '@virtality/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SelectItem } from '@/components/ui/select'
import { FormInput, FormSelect } from '@/components/ui/form'
import DeviceCard from './device-card'
import AddDeviceCard from './add-device-card'
import { DeviceSchema } from '@/lib/definitions'
import { DeviceForm } from '@/types/models'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import DeviceCardSkeleton from './device-card-skeleton'
import { v4 as uuid } from 'uuid'
import { useDeviceContext } from '@/context/device-context'
import useIsAuthed from '@/hooks/use-is-authed'
import usePageViewTracking from '@/hooks/analytics/use-page-view-tracking'

const defaultValues: DeviceForm = {
  name: '',
  model: 'Meta Quest 3S',
}

const Devices = () => {
  const { isPending } = useIsAuthed()
  usePageViewTracking({
    props: { route_group: 'device' },
  })
  const [isDialogOpen, setDialogOpen] = useState(false)
  const { devices, isLoading, createDevice } = useDeviceContext()

  const form = useForm<DeviceForm>({
    resolver: zodResolver(DeviceSchema.pick({ name: true, model: true })),
    defaultValues,
  })

  const onSubmit = (values: DeviceForm) => {
    const newDevice = {
      id: uuid(),
      deviceId: null,
      lastUsed: new Date(),
      createdAt: new Date(),
      deletedAt: null,
      ...values,
    }

    createDevice.mutate(newDevice)
    handleDialogOpen()
    form.reset()
  }

  const handleDialogOpen = () => setDialogOpen(!isDialogOpen)

  if (isLoading && isPending)
    return (
      <div className='min-h-screen-with-nav'>
        <div className='flex flex-wrap gap-6 p-4'>
          <DeviceCardSkeleton />
          <DeviceCardSkeleton />
          <DeviceCardSkeleton />
        </div>
      </div>
    )

  return (
    <div className='min-h-screen-with-nav'>
      <div className='flex flex-wrap gap-6 p-4'>
        {/* Add Device Card */}
        {!isLoading &&
          devices.map((device) => (
            <DeviceCard key={device.data.id} device={device} />
          ))}

        {createDevice.isPending && <DeviceCardSkeleton />}
        <AddDeviceCard handleDialogOpen={handleDialogOpen} />

        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent
            aria-describedby='Form to add a new device.'
            className='sm:max-w-106.25 dark:border-zinc-400 dark:bg-zinc-950 dark:text-zinc-200'
          >
            <DialogHeader>
              <DialogTitle>Add New Device</DialogTitle>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormInput
                control={form.control}
                name='name'
                label='Device Name'
                autoComplete='off'
                placeholder='Enter device name'
                data-tour='device-name'
              />

              <FormSelect
                control={form.control}
                name='model'
                label={<span className='sr-only'>Device Model</span>}
                placeholder='Select a model'
                triggerClassName='dark:border-zinc-200 dark:hover:border-zinc-400'
                contentClassName='dark:border-zinc-200 dark:bg-zinc-800'
              >
                <SelectItem
                  value='Meta Quest 3S'
                  className='dark:hover:bg-zinc-700'
                >
                  Meta Quest 3S
                </SelectItem>
              </FormSelect>

              <DialogFooter className='pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleDialogOpen}
                >
                  Cancel
                </Button>
                <Button type='submit' data-tour='device-submit'>
                  Add Device
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default Devices
