'use client'

import type { ProvisionedDeviceListItem } from '@virtality/react-query'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PairingCodePanel } from './pairing-code-panel'

type PairHeadsetDialogProps = {
  device: ProvisionedDeviceListItem | null
  onOpenChange: (open: boolean) => void
}

/** Pairs a headset to a Provisioned Device that has none yet. */
export function PairHeadsetDialog({
  device,
  onOpenChange,
}: PairHeadsetDialogProps) {
  return (
    <Dialog open={device != null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pair {device?.name}</DialogTitle>
          <DialogDescription>
            Put the headset on, open pairing and enter this code.
          </DialogDescription>
        </DialogHeader>
        {device ? <PairingCodePanel deviceRecordId={device.id} /> : null}
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
