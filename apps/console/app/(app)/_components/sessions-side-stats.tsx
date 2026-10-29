'use client'

import Link from 'next/link'
import { formatRelative } from 'date-fns'
import { Badge } from '@virtality/ui/components/badge'
import { Skeleton } from '@virtality/ui/components/skeleton'
import { cn } from '@/lib/utils'
import { useClientT } from '@/i18n/use-client-t'
import {
  formatHeadsetTime,
  type HomeSessionsSummary,
} from '@/lib/home-sessions-summary'
import HomeSectionLabel from './home-section-label'
import PatientInitialsAvatar from './patient-initials-avatar'
import SessionsStat from './sessions-stat'

const SessionsSideStats = ({
  summary,
  isLoading,
}: {
  summary: HomeSessionsSummary
  isLoading: boolean
}) => {
  const { t } = useClientT('home')
  const maxProgram = summary.byProgram[0]?.count ?? 0
  const last = summary.lastSession

  if (isLoading) {
    return (
      <aside className='bg-sidebar flex flex-col gap-5 border-t p-6 lg:border-t-0 lg:border-l'>
        <Skeleton className='h-24 w-full' />
        <Skeleton className='h-20 w-full' />
      </aside>
    )
  }

  return (
    <aside className='bg-sidebar flex flex-col gap-5 border-t p-6 lg:border-t-0 lg:border-l'>
      <div className='grid grid-cols-2 gap-x-4 gap-y-2.5'>
        <SessionsStat
          label={t('sessions.completed')}
          value={summary.completed}
        />
        <SessionsStat
          label={t('sessions.interrupted')}
          value={summary.interrupted}
          className={cn(
            summary.interrupted > 0 && 'text-amber-700 dark:text-amber-300',
          )}
        />
        <SessionsStat
          label={t('sessions.avgLength')}
          value={
            summary.avgLengthMin === null
              ? '—'
              : t('sessions.minutes', { count: summary.avgLengthMin })
          }
        />
        <SessionsStat
          label={t('sessions.headsetTime')}
          value={formatHeadsetTime(summary.headsetMinutes, t)}
        />
      </div>

      <div>
        <HomeSectionLabel className='mb-2.5 block'>
          {t('sessions.byProgram')}
        </HomeSectionLabel>
        {summary.byProgram.length === 0 ? (
          <p className='text-muted-foreground text-[13px]'>
            {t('sessions.noneThisWeek')}
          </p>
        ) : (
          <div className='flex flex-col gap-2'>
            {summary.byProgram.slice(0, 4).map((program) => (
              <div
                key={program.name}
                className='grid grid-cols-[minmax(0,1fr)_88px_20px] items-center gap-2.5 text-[13px]'
              >
                <span className='truncate'>{program.name}</span>
                <span className='bg-muted h-2 overflow-hidden rounded-full'>
                  <i
                    className='block h-full rounded-full bg-[hsl(160_95%_30%)] dark:bg-[hsl(150_90%_45%)]'
                    style={{ width: `${(program.count / maxProgram) * 100}%` }}
                  />
                </span>
                <b className='text-right font-medium tabular-nums'>
                  {program.count}
                </b>
              </div>
            ))}
          </div>
        )}
      </div>

      {last ? (
        <div>
          <HomeSectionLabel className='mb-2.5 block'>
            {t('sessions.lastSession')}
          </HomeSectionLabel>
          <Link
            href={`/patients/${last.patientId}/profile`}
            className='flex items-center gap-3 rounded-md'
          >
            <PatientInitialsAvatar
              name={last.patientName}
              image={last.patientImage}
            />
            <div className='min-w-0 flex-1'>
              <div className='truncate font-medium'>{last.patientName}</div>
              <small className='text-muted-foreground block truncate'>
                {formatRelative(last.at, new Date())}
                {last.durationMin !== null
                  ? ` · ${t('sessions.minutes', { count: last.durationMin })}`
                  : ''}
                {` · ${last.programName}`}
              </small>
            </div>
            <Badge
              variant='outline'
              className={cn(
                last.completed
                  ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300'
                  : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300',
              )}
            >
              {last.completed ? t('sessions.done') : t('sessions.interrupted')}
            </Badge>
          </Link>
        </div>
      ) : null}
    </aside>
  )
}

export default SessionsSideStats
