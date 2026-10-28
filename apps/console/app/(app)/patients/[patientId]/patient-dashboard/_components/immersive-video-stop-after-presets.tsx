'use client'

import { useClientT } from '@/i18n/use-client-t'
import { Check } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import {
  formatStopAfterLabel,
  IMMERSIVE_STOP_AFTER_MINUTES,
  isStopAfterOptionAvailable,
} from '@/lib/immersive-video-auto-stop'
import { cn } from '@/lib/utils'

const CHOICES: (number | null)[] = [null, ...IMMERSIVE_STOP_AFTER_MINUTES]

export function ImmersiveVideoStopAfterPresets({
  stopAfterMin,
  elapsedSec,
  onChoose,
}: {
  stopAfterMin: number | null
  elapsedSec: number | null
  onChoose: (minutes: number | null) => void
}) {
  const { t } = useClientT('patient-dashboard')
  return (
    <div
      role='listbox'
      aria-label={t('stopAfter.limits')}
      className='flex flex-col'
    >
      {CHOICES.map((minutes) => {
        const selected = minutes === stopAfterMin
        const available =
          minutes == null || isStopAfterOptionAvailable({ minutes, elapsedSec })
        return (
          <Button
            key={minutes ?? 'none'}
            type='button'
            role='option'
            aria-selected={selected}
            variant='ghost'
            size='sm'
            disabled={!available}
            onClick={() => onChoose(minutes)}
            className={cn('justify-between', selected && 'bg-accent')}
          >
            {formatStopAfterLabel(minutes)}
            {selected ? <Check /> : null}
          </Button>
        )
      })}
    </div>
  )
}
