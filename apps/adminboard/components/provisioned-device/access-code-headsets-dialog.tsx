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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AttachHeadsetDialog } from './attach-headset-dialog'
import { ProvisionedDeviceList } from './provisioned-device-list'

type AccessCodeHeadsetsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  accessCode: TrialRedeemCodeListItem
  devices: ProvisionedDeviceListItem[]
}

/** The headsets an Access Code carries, and the way to attach another. */
export function AccessCodeHeadsetsDialog({
  open,
  onOpenChange,
  accessCode,
  devices,
}: AccessCodeHeadsetsDialogProps) {
  const [attachOpen, setAttachOpen] = useState(false)
  const canAttach = accessCode.displayStatus === 'unused'

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Headsets on {accessCode.code}</DialogTitle>
            <DialogDescription>
              {canAttach
                ? 'Whoever redeems this code owns these headsets, already paired.'
                : 'This code can no longer take headsets. Move any that are not delivered to a new code.'}
            </DialogDescription>
          </DialogHeader>
          <ProvisionedDeviceList
            devices={devices}
            emptyMessage='No headsets on this code yet.'
          />
          {canAttach ? (
            <Button
              variant='primary'
              className='ml-auto flex items-center'
              onClick={() => setAttachOpen(true)}
            >
              <PlusSquare />
              Attach headset
            </Button>
          ) : null}
        </DialogContent>
      </Dialog>
      <AttachHeadsetDialog
        open={attachOpen}
        onOpenChange={setAttachOpen}
        accessCode={{ id: accessCode.id, code: accessCode.code }}
      />
    </>
  )
}
