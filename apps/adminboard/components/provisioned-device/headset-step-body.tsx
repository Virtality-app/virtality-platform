'use client'

import type { HeadsetStep } from '@/lib/provisioned-device-display'
import { AddHeadsetStep } from './add-headset-step'
import { AttachHeadsetStep } from './attach-headset-step'
import { MoveHeadsetStep } from './move-headset-step'
import { PairHeadsetStep } from './pair-headset-step'

type HeadsetStepBodyProps = {
  step: Exclude<HeadsetStep, { kind: 'list' }>
  /** Null in inventory. */
  accessCodeId: number | null
  onStep: (step: HeadsetStep) => void
  /** Back to the list, or close the dialog where there is no list. */
  onFinished: () => void
}

/** The body of one Attach, Add, Pair or Move step in the headsets dialog. */
export function HeadsetStepBody({
  step,
  accessCodeId,
  onStep,
  onFinished,
}: HeadsetStepBodyProps) {
  switch (step.kind) {
    case 'attach':
      // Only a code attaches; inventory adds.
      if (accessCodeId == null) return null
      return (
        <AttachHeadsetStep
          accessCodeId={accessCodeId}
          onAttached={(device) =>
            device.paired ? onFinished() : onStep({ kind: 'pair', device })
          }
          onAdd={() => onStep({ kind: 'add' })}
          onBack={onFinished}
        />
      )
    case 'add':
      return (
        <AddHeadsetStep
          accessCodeId={accessCodeId}
          onCreated={(device) => onStep({ kind: 'pair', device })}
          onBack={onFinished}
        />
      )
    case 'pair':
      return (
        <PairHeadsetStep
          key={step.device.id}
          deviceRecordId={step.device.id}
          onDone={onFinished}
        />
      )
    case 'move':
      return <MoveHeadsetStep device={step.device} onDone={onFinished} />
  }
}
