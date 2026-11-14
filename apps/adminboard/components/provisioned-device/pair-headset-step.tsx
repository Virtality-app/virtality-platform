'use client'

import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { PairingCodePanel } from './pairing-code-panel'

type PairHeadsetStepProps = {
  deviceRecordId: string
  onDone: () => void
}

/** The live Pairing Code. Leaving the step cancels a code still pending. */
export function PairHeadsetStep({
  deviceRecordId,
  onDone,
}: PairHeadsetStepProps) {
  return (
    <>
      <PairingCodePanel deviceRecordId={deviceRecordId} />
      <DialogFooter>
        <Button type='button' variant='outline' onClick={onDone}>
          Done
        </Button>
      </DialogFooter>
    </>
  )
}
