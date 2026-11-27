'use client'

import { Clapperboard } from 'lucide-react'
import type { ImmersiveVideoSummary } from '@/lib/session-metrics'
import { useClientT } from '@/i18n/use-client-t'
import OverviewMetricCard from './overview-metric-card'
import SessionActivityIcon from './session-activity-icon'

const minutes = (value: number) =>
  value.toLocaleString(undefined, { maximumFractionDigits: 1 })

/** Immersive Sessions in range: how many, their minutes, and by activity. */
const ImmersiveVideoOverviewCard = ({
  summary,
}: {
  summary: ImmersiveVideoSummary
}) => {
  const { t } = useClientT('patients')

  return (
    <OverviewMetricCard
      icon={Clapperboard}
      title={t('overview.immersive.title')}
      description={t('overview.immersive.description')}
      delay={0.2}
      contentClassName='space-y-3'
    >
      <div className='space-y-1'>
        <p className='text-2xl font-semibold text-zinc-900 tabular-nums dark:text-zinc-100'>
          {summary.count}{' '}
          <span className='text-sm font-normal text-zinc-500 dark:text-zinc-400'>
            {t('overview.immersive.sessions', { count: summary.count })}
          </span>
        </p>
        <p className='text-xs text-zinc-500 tabular-nums dark:text-zinc-400'>
          {t('overview.immersive.minutes', {
            total: minutes(summary.totalMin),
            average: minutes(summary.avgMin),
          })}
        </p>
      </div>
      <ul className='mt-auto space-y-1.5 text-sm'>
        {summary.byActivity.map((entry) => (
          <li
            key={entry.activity}
            className='flex items-center justify-between gap-3'
          >
            <span className='flex items-center gap-2 text-zinc-600 dark:text-zinc-300'>
              <SessionActivityIcon activity={entry.activity} />
              {t(`session.immersive.activities.${entry.activity}`)}
            </span>
            <span className='text-zinc-900 tabular-nums dark:text-zinc-100'>
              {t('overview.immersive.activityLine', {
                count: entry.count,
                minutes: minutes(entry.totalMin),
              })}
            </span>
          </li>
        ))}
      </ul>
    </OverviewMetricCard>
  )
}

export default ImmersiveVideoOverviewCard
