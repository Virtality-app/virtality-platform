'use client'

import { CheckCircle2, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCountdown } from '@/lib/provisioned-device-display'
import { cn } from '@/lib/utils'
import { useStaffPairing } from './use-staff-pairing'

type PairingCodePanelProps = {
  deviceRecordId: string
}

/** The live 6-digit Pairing Code a staff member types into the headset. */
export function PairingCodePanel({ deviceRecordId }: PairingCodePanelProps) {
  const { phase, code, secondsLeft, message, requestCode } =
    useStaffPairing(deviceRecordId)

  if (phase === 'paired') {
    return (
      <div className='flex flex-col items-center gap-2 py-6 text-center'>
        <CheckCircle2 className='size-10 text-green-600' />
        <p className='font-medium'>Headset paired</p>
        <p className='text-muted-foreground text-sm'>
          It will show as paired for whoever redeems the code.
        </p>
      </div>
    )
  }

  if (phase === 'starting') {
    return (
      <div className='text-muted-foreground flex items-center justify-center gap-2 py-6 text-sm'>
        <Loader2 className='size-4 animate-spin' />
        Getting a Pairing Code…
      </div>
    )
  }

  const live = phase === 'waiting'

  return (
    <div className='flex flex-col items-center gap-3 py-4 text-center'>
      {code ? (
        <p
          aria-label='Pairing Code'
          className={cn(
            'font-mono text-4xl font-semibold tracking-[0.3em]',
            !live && 'text-muted-foreground line-through',
          )}
        >
          {code}
        </p>
      ) : null}
      {live ? (
        <p className='text-muted-foreground flex items-center gap-2 text-sm'>
          <Loader2 className='size-4 animate-spin' />
          Enter this code on the headset · {formatCountdown(secondsLeft)}
        </p>
      ) : (
        <>
          {message ? (
            <p className='text-destructive text-sm'>{message}</p>
          ) : null}
          <Button type='button' variant='outline' onClick={requestCode}>
            <RefreshCw />
            Get a new code
          </Button>
        </>
      )}
    </div>
  )
}
