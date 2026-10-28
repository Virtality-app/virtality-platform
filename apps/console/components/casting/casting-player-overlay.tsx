import { CircleAlert, MonitorPlay } from 'lucide-react'
import { useClientT } from '@/i18n/use-client-t'
import type { CastingPlayerView } from '@/lib/patient-dashboard-casting-panel'
import { CastingLoadingState } from './casting-loading-state'
import { CastingPlaceholder } from './casting-placeholder'

export function CastingPlayerOverlay({ view }: { view: CastingPlayerView }) {
  const { t } = useClientT('patient-dashboard')
  switch (view) {
    case 'idle':
      return (
        <CastingPlaceholder
          icon={<MonitorPlay className='size-10 opacity-60' />}
          title={t('casting.idleTitle')}
          description={t('casting.idleDescription')}
        />
      )
    case 'loading':
      return <CastingLoadingState />
    case 'error':
      return (
        <CastingPlaceholder
          icon={<CircleAlert className='size-10' />}
          title={t('casting.errorTitle')}
          description={t('casting.errorDescription')}
          variant='error'
        />
      )
    case 'connected':
      return null
  }
}
