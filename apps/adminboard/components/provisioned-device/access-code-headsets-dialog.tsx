'use client'

import type { ProvisionedDeviceListItem } from '@virtality/react-query'
import type { TrialRedeemCodeListItem } from '@virtality/shared/utils'
import { PlusSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog'
import {
  headsetStepHeading,
  type HeadsetStep,
} from '@/lib/provisioned-device-display'
import { HeadsetStepBody } from './headset-step-body'
import { HeadsetStepTitle } from './headset-step-title'
import { ProvisionedDeviceList } from './provisioned-device-list'

type AccessCodeHeadsetsDialogProps = {
  /** The step on show; null closes the dialog. */
  step: HeadsetStep | null
  onStepChange: (step: HeadsetStep | null) => void
  accessCode: TrialRedeemCodeListItem
  devices: ProvisionedDeviceListItem[]
}

const LIST: HeadsetStep = { kind: 'list' }

/**
 * One dialog for a code's headsets. Attach, Add, Pair and Move are steps
 * inside it, each returning to the list, so no dialog opens on top of
 * another. The caller holds the step, so it can open straight on Attach.
 */
export function AccessCodeHeadsetsDialog({
  step,
  onStepChange,
  accessCode,
  devices,
}: AccessCodeHeadsetsDialogProps) {
  const canAttach = accessCode.displayStatus === 'unused'
  const shown = step ?? LIST
  const heading = headsetStepHeading(shown, accessCode.code)

  return (
    <Dialog
      open={step != null}
      onOpenChange={(open) => !open && onStepChange(null)}
    >
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <HeadsetStepTitle step={shown} title={heading.title} />
          <DialogDescription>
            {shown.kind === 'list' && !canAttach
              ? 'This code can no longer take headsets. Move any not yet delivered to a new code.'
              : heading.description}
          </DialogDescription>
        </DialogHeader>
        {shown.kind === 'list' ? (
          <>
            <ProvisionedDeviceList
              devices={devices}
              emptyMessage='No headsets on this code yet.'
              onPair={(device) => onStepChange({ kind: 'pair', device })}
              onMove={(device) => onStepChange({ kind: 'move', device })}
              inDialog
            />
            {canAttach ? (
              <DialogFooter>
                <Button
                  variant='primary'
                  className='flex items-center'
                  onClick={() => onStepChange({ kind: 'attach' })}
                >
                  <PlusSquare />
                  Attach headset
                </Button>
              </DialogFooter>
            ) : null}
          </>
        ) : (
          <HeadsetStepBody
            step={shown}
            accessCodeId={accessCode.id}
            onStep={onStepChange}
            onFinished={() => onStepChange(LIST)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
