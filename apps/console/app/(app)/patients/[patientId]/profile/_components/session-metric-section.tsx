'use client'

import { Separator } from '@virtality/ui/components/separator'
import { getDisplayName } from '@/lib/utils'
import {
  getSessionDurationMinutes,
  getExerciseQualityScore,
  getPeakCapability,
  getStabilityScore,
  getFatigueIndex,
  getSetToSetAdaptation,
  getDosePerSession,
  getDosePerExercise,
} from '@/lib/session-metrics'
import { ExtendedPatientSession } from '@/types/models'
import { Exercise } from '@virtality/db'
import { BarChart3, Zap, Target } from 'lucide-react'
import { TooltipProvider } from '@virtality/ui/components/tooltip'
import MetricInfo from './session-metric-info'
import { useClientT } from '@/i18n/use-client-t'

const MetricSection = ({
  session,
  exercises,
}: {
  session: ExtendedPatientSession
  exercises?: Exercise[]
}) => {
  const { t } = useClientT('patients')
  const durationMin = getSessionDurationMinutes(session)
  const quality = getExerciseQualityScore(session)
  const qualityAvg = quality.length
    ? quality.reduce((a, b) => a + b.avgProgressPct, 0) / quality.length
    : 0
  const peak = getPeakCapability(session)
  const stability = getStabilityScore(session, 'sd')
  const fatigue = getFatigueIndex(session, 'within-set')
  const setToSet = getSetToSetAdaptation(session)
  const doseTotal = getDosePerSession(session)
  const dosePerEx = getDosePerExercise(session)

  return (
    <>
      <Separator />
      <TooltipProvider delayDuration={200}>
        <div className='space-y-4'>
          <h3 className='font-medium'>{t('metrics.title')}</h3>
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {durationMin != null && (
              <div className='flex items-center gap-2 rounded-lg border border-zinc-200/80 bg-zinc-50/50 p-3 dark:border-zinc-700/80 dark:bg-zinc-800/40'>
                <BarChart3 className='size-4 shrink-0 text-teal-600 dark:text-teal-400' />
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-1.5'>
                    <p className='text-muted-foreground text-xs'>
                      {t('metrics.duration.title')}
                    </p>
                    <MetricInfo
                      title={t('metrics.duration.title')}
                      description={t('metrics.duration.description')}
                    />
                  </div>
                  <p className='font-semibold tabular-nums'>
                    {t('metrics.minutes', { minutes: durationMin.toFixed(1) })}
                  </p>
                </div>
              </div>
            )}
            <div className='flex items-center gap-2 rounded-lg border border-zinc-200/80 bg-zinc-50/50 p-3 dark:border-zinc-700/80 dark:bg-zinc-800/40'>
              <Target className='size-4 shrink-0 text-teal-600 dark:text-teal-400' />
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-1.5'>
                  <p className='text-muted-foreground text-xs'>
                    {t('metrics.averageProgress.title')}
                  </p>
                  <MetricInfo
                    title={t('metrics.averageProgress.title')}
                    description={t('metrics.averageProgress.description')}
                    footnote={t('metrics.averageProgress.footnote')}
                  />
                </div>
                <p className='font-semibold tabular-nums'>
                  {qualityAvg.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2 rounded-lg border border-zinc-200/80 bg-zinc-50/50 p-3 dark:border-zinc-700/80 dark:bg-zinc-800/40'>
              <Zap className='size-4 shrink-0 text-teal-600 dark:text-teal-400' />
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-1.5'>
                  <p className='text-muted-foreground text-xs'>
                    {t('metrics.bestRepetition.title')}
                  </p>
                  <MetricInfo
                    title={t('metrics.bestRepetition.title')}
                    description={t('metrics.bestRepetition.description')}
                    footnote={t('metrics.bestRepetition.footnote')}
                  />
                </div>
                <p className='font-semibold tabular-nums'>
                  {peak.sessionBest.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2 rounded-lg border border-zinc-200/80 bg-zinc-50/50 p-3 dark:border-zinc-700/80 dark:bg-zinc-800/40'>
              <div className='flex size-4 shrink-0 items-center justify-center rounded bg-teal-100 text-xs font-bold text-teal-700 dark:bg-teal-900/50 dark:text-teal-300'>
                σ
              </div>
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-1.5'>
                  <p className='text-muted-foreground text-xs'>
                    {t('metrics.consistency.title')}
                  </p>
                  <MetricInfo
                    title={t('metrics.consistency.title')}
                    description={t('metrics.consistency.description')}
                    footnote={t('metrics.consistency.footnote')}
                  />
                </div>
                <p className='font-semibold tabular-nums'>
                  {stability.sessionValue.toFixed(2)}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2 rounded-lg border border-zinc-200/80 bg-zinc-50/50 p-3 dark:border-zinc-700/80 dark:bg-zinc-800/40'>
              <div className='size-4 shrink-0 rounded bg-amber-100 text-center text-xs font-bold text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'>
                F
              </div>
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-1.5'>
                  <p className='text-muted-foreground text-xs'>
                    {t('metrics.fatigue.title')}
                  </p>
                  <MetricInfo
                    title={t('metrics.fatigue.title')}
                    description={t('metrics.fatigue.description')}
                    footnote={t('metrics.fatigue.footnote')}
                  />
                </div>
                <p className='font-semibold tabular-nums'>
                  {fatigue.sessionDropOffPct.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2 rounded-lg border border-zinc-200/80 bg-zinc-50/50 p-3 dark:border-zinc-700/80 dark:bg-zinc-800/40'>
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-1.5'>
                  <p className='text-muted-foreground text-xs'>
                    {t('metrics.firstToLast.title')}
                  </p>
                  <MetricInfo
                    title={t('metrics.firstToLast.title')}
                    description={t('metrics.firstToLast.description')}
                    footnote={t('metrics.firstToLast.footnote')}
                  />
                </div>
                <p className='font-semibold tabular-nums'>
                  {setToSet.sessionPctChange >= 0 ? '+' : ''}
                  {setToSet.sessionPctChange.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2 rounded-lg border border-zinc-200/80 bg-zinc-50/50 p-3 sm:col-span-2 lg:col-span-3 dark:border-zinc-700/80 dark:bg-zinc-800/40'>
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-1.5'>
                  <p className='text-muted-foreground text-xs'>
                    {t('metrics.volume.title')}
                  </p>
                  <MetricInfo
                    title={t('metrics.volume.title')}
                    description={t('metrics.volume.description')}
                  />
                </div>
                <p className='font-semibold tabular-nums'>
                  {doseTotal.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </p>
                {dosePerEx.length > 0 && (
                  <ul className='text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs'>
                    {dosePerEx.map((d, i) => {
                      const ex = exercises?.find((e) => e.id === d.exerciseId)
                      return (
                        <li key={i}>
                          {getDisplayName(ex)}:{' '}
                          {d.dose.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </>
  )
}

export default MetricSection
