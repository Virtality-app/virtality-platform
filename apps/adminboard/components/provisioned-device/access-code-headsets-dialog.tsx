'use client'

import type { ProvisionedDeviceListItem } from '@virtality/react-query'
import type { TrialRedeemCodeListItem } from '@virtality/shared/utils'
import { PlusSquare } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  headsetStepHeading,
  type HeadsetStep,
} from '@/lib/provisioned-device-display'
import { HeadsetStepBody } from './headset-step-body'
import { ProvisionedDeviceList } from './provisioned-device-list'

type AccessCodeHeadsetsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  accessCode: TrialRedeemCodeListItem
  devices: ProvisionedDeviceListItem[]
}

const LIST: HeadsetStep = { kind: 'list' }

/**
 * One dialog for a code's headsets. Attach, Pair and Move are steps inside
 * it, each returning to the list, so no dialog opens on top of another.
 */
export function AccessCodeHeadsetsDialog({
  open,
  onOpenChange,
  accessCode,
  devices,
}: AccessCodeHeadsetsDialogProps) {
  const [step, setStep] = useState<HeadsetStep>(LIST)
  const canAttach = accessCode.displayStatus === 'unused'
  const heading = headsetStepHeading(step, accessCode.code)

  const handleOpenChange = (next: boolean) => {
    if (!next) setStep(LIST)
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{heading.title}</DialogTitle>
          <DialogDescription>
            {step.kind === 'list' && !canAttach
              ? 'This code can no longer take headsets. Move any not yet delivered to a new code.'
              : heading.description}
          </DialogDescription>
        </DialogHeader>
        {step.kind === 'list' ? (
          <>
            <ProvisionedDeviceList
              devices={devices}
              emptyMessage='No headsets on this code yet.'
              onPair={(device) => setStep({ kind: 'pair', device })}
              onMove={(device) => setStep({ kind: 'move', device })}
            />
            {canAttach ? (
              <DialogFooter>
                <Button
                  variant='primary'
                  className='flex items-center'
                  onClick={() => setStep({ kind: 'attach' })}
                >
                  <PlusSquare />
                  Attach headset
                </Button>
              </DialogFooter>
            ) : null}
          </>
        ) : (
          <HeadsetStepBody
            step={step}
            accessCodeId={accessCode.id}
            onStep={setStep}
            onFinished={() => setStep(LIST)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
