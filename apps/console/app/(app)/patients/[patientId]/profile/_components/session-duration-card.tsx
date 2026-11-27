'use client'

import { Activity } from 'lucide-react'
import { getSessionDurationTrend } from '@/lib/session-metrics'
import type { ExtendedPatientSession } from '@/types/models'
import { useClientT } from '@/i18n/use-client-t'
import OverviewMetricCard from './overview-metric-card'

/** Average length of the completed exercise sessions given. */
const SessionDurationCard = ({
  sessions,
}: {
  sessions: ExtendedPatientSession[]
}) => {
  const { t } = useClientT('patients')
  const durationTrend = getSessionDurationTrend(sessions)
  const avgDuration =
    durationTrend.length > 0
      ? durationTrend.reduce((a, b) => a + b.durationMin, 0) /
        durationTrend.length
      : null

  return (
    <OverviewMetricCard
      icon={Activity}
      title={t('overview.sessionDuration.title')}
      description={t('overview.sessionDuration.description')}
      delay={0.1}
    >
      {avgDuration != null ? (
        <p className='text-2xl font-semibold text-zinc-900 tabular-nums dark:text-zinc-100'>
          {avgDuration.toFixed(1)}{' '}
          <span className='text-sm font-normal text-zinc-500 dark:text-zinc-400'>
            {t('overview.sessionDuration.minAvg')}
          </span>
        </p>
      ) : (
        <p className='text-sm text-zinc-500 dark:text-zinc-400'>
          {t('overview.sessionDuration.none')}
        </p>
      )}
    </OverviewMetricCard>
  )
}

export default SessionDurationCard
