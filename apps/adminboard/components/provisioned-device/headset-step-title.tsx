'use client'

import { DialogTitle } from '@/components/ui/dialog'
import type { HeadsetStep } from '@/lib/provisioned-device-display'
import { PairingHelp } from './pairing-help'

type HeadsetStepTitleProps = {
  step: HeadsetStep
  title: string
}

/** Dialog title. Adding and pairing carry an info icon on how to pair. */
export function HeadsetStepTitle({ step, title }: HeadsetStepTitleProps) {
  const showHelp = step.kind === 'add' || step.kind === 'pair'
  return (
    <DialogTitle className='flex items-center gap-2'>
      {title}
      {showHelp ? <PairingHelp /> : null}
    </DialogTitle>
  )
}
