'use client'

import { useProvisionedDevices } from '@virtality/react-query'
import type { TrialRedeemCodeListItem } from '@virtality/shared/utils'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  devicesOnAccessCode,
  formatHeadsetSummary,
} from '@/lib/provisioned-device-display'
import { AccessCodeHeadsetsDialog } from './access-code-headsets-dialog'

type AccessCodeHeadsetsCellProps = {
  accessCode: TrialRedeemCodeListItem
}

/** Headsets column on the Access Code table. Every row shares one query. */
export function AccessCodeHeadsetsCell({
  accessCode,
}: AccessCodeHeadsetsCellProps) {
  const [open, setOpen] = useState(false)
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
      ) : (
        <Button
          variant='ghost'
          size='sm'
          className='h-7 px-2'
          onClick={() => setOpen(true)}
        >
          {devices.length === 0 ? 'Attach' : formatHeadsetSummary(devices)}
        </Button>
      )}
      <AccessCodeHeadsetsDialog
        open={open}
        onOpenChange={setOpen}
        accessCode={accessCode}
        devices={devices}
      />
    </>
  )
}
