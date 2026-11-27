'use client'

import { TrendingUp } from 'lucide-react'
import { getDoseTrend } from '@/lib/session-metrics'
import type { ExtendedPatientSession } from '@/types/models'
import { useClientT } from '@/i18n/use-client-t'
import OverviewMetricCard from './overview-metric-card'

/** Planned load summed over the completed exercise sessions given. */
const SessionVolumeCard = ({
  sessions,
}: {
  sessions: ExtendedPatientSession[]
}) => {
  const { t } = useClientT('patients')
  const doseTrend = getDoseTrend(sessions)
  const totalDose = doseTrend.reduce((a, b) => a + b.dose, 0)
  const avgDosePerSession =
    doseTrend.length > 0 ? totalDose / doseTrend.length : 0

  return (
    <OverviewMetricCard
      icon={TrendingUp}
      title={t('metrics.volume.title')}
      description={t('overview.volume.description')}
      delay={0.15}
      contentClassName='space-y-1'
    >
      <p className='text-2xl font-semibold text-zinc-900 tabular-nums dark:text-zinc-100'>
        {totalDose.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </p>
      <p className='text-xs text-zinc-500 dark:text-zinc-400'>
        {avgDosePerSession > 0
          ? t('overview.volume.perSession', {
              value: avgDosePerSession.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              }),
            })
          : t('overview.volume.formula')}
      </p>
    </OverviewMetricCard>
  )
}

export default SessionVolumeCard
