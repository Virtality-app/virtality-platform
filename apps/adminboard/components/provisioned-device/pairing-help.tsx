'use client'

import { Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  CodeIllustration,
  HeadsetIllustration,
  PairedIllustration,
  PairingScreenIllustration,
} from './pairing-illustrations'

const STEPS = [
  {
    Illustration: HeadsetIllustration,
    title: 'Have the headset on hand',
    body: 'Charge it, turn it on and connect it to Wi-Fi.',
  },
  {
    Illustration: PairingScreenIllustration,
    title: 'Open pairing on the headset',
    body: 'Put it on, open the Virtality app and go to pairing.',
  },
  {
    Illustration: CodeIllustration,
    title: 'Enter the Pairing Code',
    body: 'Type the 6-digit code shown here before its timer runs out. Get a new code if it does.',
  },
  {
    Illustration: PairedIllustration,
    title: 'Done',
    body: 'The dialog shows Headset paired. Whoever redeems the code finds it ready.',
  },
] as const

/**
 * Info icon beside the dialog title with the pairing steps. Modal, so it
 * nests under the dialog's focus trap (see ProvisionedDeviceActions).
 */
export function PairingHelp() {
  return (
    <Popover modal>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='text-muted-foreground size-6'
          aria-label='How to pair a headset'
        >
          <Info />
        </Button>
      </PopoverTrigger>
      <PopoverContent align='start' className='w-96'>
        <p className='mb-3 text-sm font-semibold'>How to pair a headset</p>
        <ol className='flex flex-col gap-3'>
          {STEPS.map(({ Illustration, title, body }, index) => (
            <li key={title} className='flex items-center gap-3'>
              <Illustration className='h-12 w-20 shrink-0 rounded-md bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200' />
              <div className='text-sm font-normal'>
                <p className='font-medium'>
                  {index + 1}. {title}
                </p>
                <p className='text-muted-foreground'>{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </PopoverContent>
    </Popover>
  )
}
