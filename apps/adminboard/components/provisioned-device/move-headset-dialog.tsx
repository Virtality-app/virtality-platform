'use client'

import type { ProvisionedDeviceListItem } from '@virtality/react-query'
import {
  useMoveProvisionedDevice,
  useTrialRedeemCodes,
} from '@virtality/react-query'
import { Label } from '@virtality/ui/components/label'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getErrorMessage } from '@/lib/get-error-message'

type MoveHeadsetDialogProps = {
  device: ProvisionedDeviceListItem | null
  onOpenChange: (open: boolean) => void
}

/** Moves a Device with no owner onto another unused Access Code. */
export function MoveHeadsetDialog({
  device,
  onOpenChange,
}: MoveHeadsetDialogProps) {
  const [accessCodeId, setAccessCodeId] = useState('')
  const open = device != null
  const codes = useTrialRedeemCodes(['unused'])
  const { mutate: move, isPending } = useMoveProvisionedDevice()
  const options = (codes.data ?? []).filter(
    (code) => code.id !== device?.accessCodeId,
  )

  useEffect(() => {
    if (!open) setAccessCodeId('')
  }, [open])

  const handleMove = () => {
    if (!device || !accessCodeId) return
    move(
      { deviceRecordId: device.id, accessCodeId: Number(accessCodeId) },
      {
        onSuccess: () => {
          toast.success(`${device.name} moved`)
          onOpenChange(false)
        },
        onError: (error) =>
          toast.error(getErrorMessage(error, 'Failed to move headset')),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move {device?.name}</DialogTitle>
          <DialogDescription>
            The headset stays paired. Whoever redeems the new code owns it.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-2 py-4'>
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
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
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
      </DialogContent>
    </Dialog>
  )
}
