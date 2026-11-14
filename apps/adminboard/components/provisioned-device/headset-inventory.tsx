'use client'

import { useProvisionedDevices } from '@virtality/react-query'
import { PlusSquare } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  headsetStepHeading,
  type HeadsetStep,
} from '@/lib/provisioned-device-display'
import { HeadsetStepBody } from './headset-step-body'
import { ProvisionedDeviceList } from './provisioned-device-list'

type InventoryStep = Exclude<HeadsetStep, { kind: 'list' }>

/**
 * Every Provisioned Device: spares with no code, headsets waiting on an
 * Access Code, and those a customer received by redeeming one. The list is
 * the page; Add, Pair and Move each open one dialog.
 */
export function HeadsetInventory() {
  const [step, setStep] = useState<InventoryStep | null>(null)
  const { data, isPending } = useProvisionedDevices()
  const heading = step ? headsetStepHeading(step, null) : null

  return (
    <div className='flex flex-col gap-4 p-8'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-xl font-semibold'>Headset inventory</h1>
          <p className='text-muted-foreground text-sm'>
            Every headset staff have added. Spares wait in inventory; the rest
            link to their Access Code and, once redeemed, to the customer.
          </p>
        </div>
        <Button
          variant='primary'
          className='flex items-center'
          onClick={() => setStep({ kind: 'attach' })}
        >
          <PlusSquare />
          Add headset
        </Button>
      </div>
      {isPending ? (
        <p className='text-muted-foreground text-sm'>Loading…</p>
      ) : (
        <ProvisionedDeviceList
          devices={data ?? []}
          emptyMessage='No headsets yet.'
          onPair={(device) => setStep({ kind: 'pair', device })}
          onMove={(device) => setStep({ kind: 'move', device })}
        />
      )}
      <Dialog
        open={step != null}
        onOpenChange={(open) => !open && setStep(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{heading?.title}</DialogTitle>
            <DialogDescription>{heading?.description}</DialogDescription>
          </DialogHeader>
          {step ? (
            <HeadsetStepBody
              step={step}
              accessCodeId={null}
              onStep={(next) => next.kind !== 'list' && setStep(next)}
              onFinished={() => setStep(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
