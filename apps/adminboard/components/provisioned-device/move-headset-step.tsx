'use client'

import {
  useMoveProvisionedDevice,
  useTrialRedeemCodes,
  type ProvisionedDeviceListItem,
} from '@virtality/react-query'
import { Label } from '@virtality/ui/components/label'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getErrorMessage } from '@/lib/get-error-message'

type MoveHeadsetStepProps = {
  device: ProvisionedDeviceListItem
  onDone: () => void
}

/** Moves a Device with no owner onto another unused Access Code. */
export function MoveHeadsetStep({ device, onDone }: MoveHeadsetStepProps) {
  const [accessCodeId, setAccessCodeId] = useState('')
  const codes = useTrialRedeemCodes(['unused'])
  const { mutate: move, isPending } = useMoveProvisionedDevice()
  const options = (codes.data ?? []).filter(
    (code) => code.id !== device.accessCodeId,
  )

  const handleMove = () =>
    move(
      { deviceRecordId: device.id, accessCodeId: Number(accessCodeId) },
      {
        onSuccess: () => {
          toast.success(`${device.name} moved`)
          onDone()
        },
        onError: (error) =>
          toast.error(getErrorMessage(error, 'Failed to move headset')),
      },
    )

  return (
    <>
      <div className='grid gap-2'>
        <Label htmlFor='move-access-code'>Unused Access Code</Label>
        <Select value={accessCodeId} onValueChange={setAccessCodeId}>
          <SelectTrigger id='move-access-code'>
            <SelectValue
              placeholder={
                codes.isPending
                  ? 'Loading codes…'
                  : options.length === 0
                    ? 'No unused codes'
                    : 'Pick a code'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {options.map((code) => (
              <SelectItem key={code.id} value={String(code.id)}>
                {code.code}
                {code.note ? ` · ${code.note}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button
          type='button'
          variant='outline'
          onClick={onDone}
          disabled={isPending}
        >
          Back
        </Button>
        <Button
          type='button'
          variant='primary'
          onClick={handleMove}
          disabled={isPending || !accessCodeId}
        >
          {isPending ? 'Moving...' : 'Move'}
        </Button>
      </DialogFooter>
    </>
  )
}
