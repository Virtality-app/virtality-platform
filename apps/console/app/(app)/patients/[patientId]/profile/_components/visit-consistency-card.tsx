'use client'

import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { GAP_THRESHOLD_DAYS, getVisitConsistency } from '@/lib/session-metrics'
import type { ExtendedPatientSession } from '@/types/models'
import { useDateFnsLocale } from '@/hooks/use-date-fns-locale'
import { useClientT } from '@/i18n/use-client-t'
import OverviewMetricCard from './overview-metric-card'

/** Average days between visits, exercise and immersive alike, plus long gaps. */
const VisitConsistencyCard = ({
  sessions,
}: {
  sessions: ExtendedPatientSession[]
}) => {
  const { t } = useClientT('patients')
  const locale = useDateFnsLocale()
  const { avgDaysBetween, gaps } = getVisitConsistency(sessions)

  return (
    <OverviewMetricCard
      icon={CalendarIcon}
      title={t('overview.visitConsistency.title')}
      description={t('overview.visitConsistency.description')}
      footnote={t('overview.visitConsistency.footnote', {
        days: GAP_THRESHOLD_DAYS,
      })}
      delay={0.05}
      contentClassName='space-y-3'
    >
      {avgDaysBetween != null ? (
        <p className='text-2xl font-semibold text-zinc-900 tabular-nums dark:text-zinc-100'>
          {avgDaysBetween.toFixed(1)}{' '}
          <span className='text-sm font-normal text-zinc-500 dark:text-zinc-400'>
            {t('overview.visitConsistency.daysAvg')}
          </span>
        </p>
      ) : (
        <p className='text-sm text-zinc-500 dark:text-zinc-400'>
          {t('overview.visitConsistency.needMoreSessions')}
        </p>
      )}
      {gaps.length > 0 && (
        <div className='mt-auto rounded-lg border border-amber-200/80 bg-amber-50/80 p-2 dark:border-amber-800/60 dark:bg-amber-950/30'>
          <p className='text-xs font-medium text-amber-800 dark:text-amber-200'>
            {t('overview.visitConsistency.gaps', {
              count: gaps.length,
              days: GAP_THRESHOLD_DAYS,
            })}
          </p>
          <ul className='mt-1 text-xs text-amber-700 dark:text-amber-300'>
            {gaps.slice(0, 3).map((g, i) => (
              <li key={i}>
                {t('overview.visitConsistency.gapRange', {
                  from: format(g.prevCompletedAt, 'd MMM', { locale }),
                  to: format(g.nextCompletedAt, 'd MMM', { locale }),
                  days: g.daysBetween.toFixed(0),
                })}
              </li>
            ))}
            {gaps.length > 3 && (
              <li>
                {t('overview.visitConsistency.moreGaps', {
                  count: gaps.length - 3,
                })}
              </li>
            )}
          </ul>
        </div>
      )}
    </OverviewMetricCard>
  )
}

export default VisitConsistencyCard
