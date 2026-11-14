'use client'

import type { HeadsetStep } from '@/lib/provisioned-device-display'
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

/** The body of one Attach, Pair or Move step inside the headsets dialog. */
export function HeadsetStepBody({
  step,
  accessCodeId,
  onStep,
  onFinished,
}: HeadsetStepBodyProps) {
  switch (step.kind) {
    case 'attach':
      return (
        <AttachHeadsetStep
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
