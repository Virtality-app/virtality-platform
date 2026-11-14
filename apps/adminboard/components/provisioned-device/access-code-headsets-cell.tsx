'use client'

import { useProvisionedDevices } from '@virtality/react-query'
import type { TrialRedeemCodeListItem } from '@virtality/shared/utils'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  devicesOnAccessCode,
  formatHeadsetSummary,
  type HeadsetStep,
} from '@/lib/provisioned-device-display'
import { AccessCodeHeadsetsDialog } from './access-code-headsets-dialog'

type AccessCodeHeadsetsCellProps = {
  accessCode: TrialRedeemCodeListItem
}

/** Headsets column on the Access Code table. Every row shares one query. */
export function AccessCodeHeadsetsCell({
  accessCode,
}: AccessCodeHeadsetsCellProps) {
  // Null while the dialog is closed.
  const [step, setStep] = useState<HeadsetStep | null>(null)
  const { data } = useProvisionedDevices()
  const devices = devicesOnAccessCode(data ?? [], accessCode.id)
  const canAttach = accessCode.displayStatus === 'unused'

  // A closed code with nothing on it has nothing to open. The dialog stays
  // mounted while open, so moving the last headset off doesn't drop it.
  const nothingToOpen = devices.length === 0 && !canAttach

  return (
    <>
      {nothingToOpen ? (
        <div>—</div>
      ) : devices.length === 0 ? (
        <Button
          variant='outline'
          size='sm'
          className='h-7'
          onClick={() => setStep({ kind: 'attach' })}
        >
          <Plus />
          Attach
        </Button>
      ) : (
        <Button
          variant='ghost'
          size='sm'
          className='h-7 px-2'
          onClick={() => setStep({ kind: 'list' })}
        >
          {formatHeadsetSummary(devices)}
        </Button>
      )}
      <AccessCodeHeadsetsDialog
        step={step}
        onStepChange={setStep}
        accessCode={accessCode}
        devices={devices}
      />
    </>
  )
}
