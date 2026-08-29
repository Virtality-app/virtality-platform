'use client'

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
import { Input } from '@virtality/ui/components/input'
import { Label } from '@virtality/ui/components/label'
import { Textarea } from '@virtality/ui/components/textarea'
import {
  DEFAULT_TRIAL_REDEEM_DAYS,
  FREE_REDEEM_CODE_TERM,
  FREE_REDEEM_MODE_LABELS,
} from '@virtality/shared/utils'
import { useCreateTrialRedeemCode } from '@virtality/react-query'
import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'

type CreateTrialRedeemCodeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type RedeemMode = 'timed' | 'permanent'

export function CreateTrialRedeemCodeDialog({
  open,
  onOpenChange,
}: CreateTrialRedeemCodeDialogProps) {
  const [mode, setMode] = useState<RedeemMode>('timed')
  const [trialDays, setTrialDays] = useState('')
  const [note, setNote] = useState('')
  const { mutate: createTrialRedeemCode, isPending } =
    useCreateTrialRedeemCode()

  useEffect(() => {
    if (!open) {
      setMode('timed')
      setTrialDays('')
      setNote('')
    }
  }, [open])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    const payload: { trialDays?: number; note?: string } = {}

    if (mode === 'permanent') {
      payload.trialDays = 0
    } else {
      const trimmedDays = trialDays.trim()
      if (trimmedDays !== '') {
        const parsedDays = Number(trimmedDays)
        if (!Number.isInteger(parsedDays) || parsedDays < 1) {
          toast.error('Trial days must be a positive whole number')
          return
        }
        payload.trialDays = parsedDays
      }
    }

    const trimmedNote = note.trim()
    if (trimmedNote !== '') {
      payload.note = trimmedNote
    }

    createTrialRedeemCode(payload, {
      onSuccess: (created) => {
        toast.success(`Created ${created.code}`)
        onOpenChange(false)
      },
      onError: () => {
        toast.error(`Failed to create ${FREE_REDEEM_CODE_TERM}`)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create {FREE_REDEEM_CODE_TERM}</DialogTitle>
            <DialogDescription>
              Generates a one-time `PAY-` bearer code. Choose{' '}
              {FREE_REDEEM_MODE_LABELS.timed.toLowerCase()} (default{' '}
              {DEFAULT_TRIAL_REDEEM_DAYS} days) or{' '}
              {FREE_REDEEM_MODE_LABELS.permanent.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='redeem-mode'>Mode</Label>
              <Select
                value={mode}
                onValueChange={(value) => setMode(value as RedeemMode)}
              >
                <SelectTrigger id='redeem-mode'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='timed'>
                    {FREE_REDEEM_MODE_LABELS.timed}
                  </SelectItem>
                  <SelectItem value='permanent'>
                    {FREE_REDEEM_MODE_LABELS.permanent}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {mode === 'timed' ? (
              <div className='grid gap-2'>
                <Label htmlFor='trial-days'>Trial days (optional)</Label>
                <Input
                  id='trial-days'
                  type='number'
                  min={1}
                  step={1}
                  placeholder={String(DEFAULT_TRIAL_REDEEM_DAYS)}
                  value={trialDays}
                  onChange={(event) => setTrialDays(event.target.value)}
                />
              </div>
            ) : null}
            <div className='grid gap-2'>
              <Label htmlFor='trial-note'>Note (optional)</Label>
              <Textarea
                id='trial-note'
                placeholder='Why this code was issued'
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
              />
            </div>
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
            <Button type='submit' variant='primary' disabled={isPending}>
              {isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
