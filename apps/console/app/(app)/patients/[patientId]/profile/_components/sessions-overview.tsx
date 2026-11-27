'use client'

import { getImmersiveVideoSummary } from '@/lib/session-metrics'
import {
  DATE_RANGE_PRESETS,
  filterSessionsByDateRange,
  getFirstCompletedSessionDay,
  getSessionCalendarDays,
  type DateRangePreset,
} from '@/lib/session-date-range'
import { filterCompletedClinicalSessions } from '@/lib/session-history'
import type { ExtendedPatientSession } from '@/types/models'
import { Button } from '@virtality/ui/components/button'
import { motion } from 'motion/react'
import { TooltipProvider } from '@virtality/ui/components/tooltip'
import { cn } from '@/lib/utils'
import { SessionDatePicker } from './session-date-picker'
import { useClientT } from '@/i18n/use-client-t'
import VisitConsistencyCard from './visit-consistency-card'
import SessionDurationCard from './session-duration-card'
import SessionVolumeCard from './session-volume-card'
import ImmersiveVideoOverviewCard from './immersive-video-overview-card'

interface SessionsOverviewProps {
  sessions: ExtendedPatientSession[]
  startDate: Date
  endDate: Date
  onStartDateChange: (date: Date) => void
  onEndDateChange: (date: Date) => void
  onPresetSelect: (preset: DateRangePreset) => void
}

export function SessionsOverview({
  sessions,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onPresetSelect,
}: SessionsOverviewProps) {
  const { t } = useClientT('patients')
  const range = { startDate, endDate }
  const filtered = filterSessionsByDateRange(
    filterCompletedClinicalSessions(sessions),
    range,
  )
  // Interrupted video runs keep a duration, so the video card counts them.
  const immersiveSummary = getImmersiveVideoSummary(
    filterSessionsByDateRange(sessions, range),
  )
  const today = new Date()
  const sessionDays = getSessionCalendarDays(sessions)
  const firstSessionDay = getFirstCompletedSessionDay(sessions)
  const isBeforeFirstSession = (date: Date) =>
    firstSessionDay != null && date < firstSessionDay

  return (
    <motion.div
      className='space-y-6'
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className='space-y-4 rounded-xl border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950'>
        <div className='flex flex-wrap items-end gap-4'>
          <SessionDatePicker
            label={t('overview.startDate')}
            selected={startDate}
            onSelect={onStartDateChange}
            isDateDisabled={(date) =>
              date > endDate || date > today || isBeforeFirstSession(date)
            }
            sessionDays={sessionDays}
          />
          <SessionDatePicker
            label={t('overview.endDate')}
            selected={endDate}
            onSelect={onEndDateChange}
            isDateDisabled={(date) =>
              date < startDate || date > today || isBeforeFirstSession(date)
            }
            sessionDays={sessionDays}
          />
          <p className='ml-auto text-sm text-zinc-500 dark:text-zinc-400'>
            {t('overview.inRange', { count: filtered.length })}
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          {DATE_RANGE_PRESETS.map((preset) => (
            <Button
              key={preset}
              type='button'
              size='sm'
              variant='outline'
              className='border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900/50'
              onClick={() => onPresetSelect(preset)}
            >
              {t(`overview.presets.${preset}`)}
            </Button>
          ))}
        </div>
      </div>

      <TooltipProvider delayDuration={200}>
        <div
          className={cn(
            'grid gap-4 sm:grid-cols-2',
            immersiveSummary ? 'xl:grid-cols-4' : 'lg:grid-cols-3',
          )}
        >
          <VisitConsistencyCard sessions={filtered} />
          <SessionDurationCard sessions={filtered} />
          <SessionVolumeCard sessions={filtered} />
          {immersiveSummary ? (
            <ImmersiveVideoOverviewCard summary={immersiveSummary} />
          ) : null}
        </div>
      </TooltipProvider>
    </motion.div>
  )
}
