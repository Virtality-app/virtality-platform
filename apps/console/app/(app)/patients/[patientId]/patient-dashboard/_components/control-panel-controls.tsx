import { Play, Square } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import type { NotifyId } from '@/lib/notify'
import { useClientT } from '@/i18n/use-client-t'
import { PatientDashboardValue } from '@/context/patient-dashboard-context'

interface ControlsProps {
  className?: string
  selectedMode: PatientDashboardValue['state']['selectedMode']
  isProgramInactive: boolean
  treatmentLaunchReady: boolean
  programStart: () => NotifyId | undefined
  handleWarmupStart: () => NotifyId | undefined
}

/**
 * The toolbar's start control. Once an exercise session runs, its controls
 * move to the session panel, so here they only start a session or a warm-up.
 */
const Controls = ({
  className,
  selectedMode,
  isProgramInactive,
  treatmentLaunchReady,
  programStart,
  handleWarmupStart,
}: ControlsProps) => {
  const { t } = useClientT('patient-dashboard')

  switch (selectedMode) {
    case 'main':
      if (!isProgramInactive) return null
      return (
        <Button
          variant='primary'
          className={className}
          onClick={programStart}
          disabled={!treatmentLaunchReady}
        >
          <Play className='size-4' />
          {t('controls.start')}
        </Button>
      )

    case 'free':
      return (
        <Button
          variant={isProgramInactive ? 'primary' : 'destructive'}
          className={className}
          onClick={handleWarmupStart}
          disabled={isProgramInactive && !treatmentLaunchReady}
        >
          {isProgramInactive ? (
            <Play className='size-4' />
          ) : (
            <Square className='size-4 fill-current' />
          )}
          {isProgramInactive
            ? t('controls.startWarmup')
            : t('controls.endWarmup')}
        </Button>
      )

    default:
      return null
  }
}

export default Controls
