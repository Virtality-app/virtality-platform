import { formatMinutes } from '@/lib/dashboard-format'
import {
  SESSION_TYPES,
  SESSION_TYPE_LABELS,
  type SessionActivityReport,
} from '@/lib/dashboard-types'
import { TypeSplitBar } from '../type-split-bar'
import { SplitStatCard } from './split-stat-card'

type OverviewStatCardsProps = {
  summary: SessionActivityReport['summary']
  /**
   * All Time shows every patient, with or without sessions, as Unique
   * patients, and no short-session note.
   */
  allTime: boolean
}

/** Matches `SHORT_SESSION_MINUTES` in the session activity report. */
const SHORT_SESSION_MINUTES = 5

export function OverviewStatCards({
  summary,
  allTime,
}: OverviewStatCardsProps) {
  return (
    <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      <SplitStatCard
        title='Sessions'
        value={summary.sessionCount.toLocaleString()}
      >
        <TypeSplitBar counts={summary.sessionsByType} label='Sessions' />
        <p className='text-muted-foreground flex flex-wrap gap-x-3 text-xs'>
          {SESSION_TYPES.map((type) => (
            <span key={type}>
              <b className='text-foreground font-semibold'>
                {summary.sessionsByType[type]}
              </b>{' '}
              {SESSION_TYPE_LABELS[type]}
            </span>
          ))}
        </p>
        {allTime ? null : (
          <p className='text-muted-foreground text-xs'>
            Includes {summary.shortSessionCount.toLocaleString()} sessions under{' '}
            {SHORT_SESSION_MINUTES} min
          </p>
        )}
      </SplitStatCard>

      <SplitStatCard
        title={allTime ? 'Unique patients' : 'Active patients'}
        value={
          allTime ? (
            summary.totalPatients.toLocaleString()
          ) : (
            <>
              {summary.activePatients.toLocaleString()}
              <span className='text-muted-foreground text-sm font-medium'>
                {' '}
                of {summary.totalPatients.toLocaleString()}
              </span>
            </>
          )
        }
      />

      <SplitStatCard
        title='Time in therapy'
        value={formatMinutes(summary.totalMinutes)}
      >
        <TypeSplitBar counts={summary.minutesByType} label='Minutes' />
        <p className='text-muted-foreground text-xs'>
          Start to end of the {summary.sessionsWithDuration.toLocaleString()}{' '}
          sessions with an end time, or a Don’t Save time
        </p>
      </SplitStatCard>

      <SplitStatCard
        title='Average session length'
        value={formatMinutes(summary.averageMinutes)}
      >
        <dl className='text-muted-foreground flex flex-col gap-1 text-xs'>
          {SESSION_TYPES.map((type) => (
            <div key={type} className='flex justify-between'>
              <dt>{SESSION_TYPE_LABELS[type]}</dt>
              <dd className='text-foreground font-semibold'>
                {formatMinutes(summary.averageMinutesByType[type])}
              </dd>
            </div>
          ))}
        </dl>
      </SplitStatCard>
    </div>
  )
}
