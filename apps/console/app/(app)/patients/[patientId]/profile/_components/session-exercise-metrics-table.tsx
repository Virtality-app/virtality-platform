'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@virtality/ui/components/table'
import type { Exercise } from '@virtality/db'
import { getDisplayName } from '@/lib/utils'
import { buildSessionExerciseMetricRows } from '@/lib/session-exercise-metrics'
import type { ExtendedPatientSession } from '@/types/models'
import { useClientT } from '@/i18n/use-client-t'

const formatPct = (value: number | null, signed = false) => {
  if (value == null) return '—'
  const sign = signed && value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

const formatPoints = (value: number | null) =>
  value == null ? '—' : value.toFixed(1)

const SessionExerciseMetricsTable = ({
  session,
  exercises,
}: {
  session: ExtendedPatientSession
  exercises?: Exercise[]
}) => {
  const { t } = useClientT('patients')
  const rows = buildSessionExerciseMetricRows(session)

  if (rows.length === 0) return null

  return (
    <div className='space-y-4'>
      <h3 className='font-medium'>{t('exerciseMetrics.title')}</h3>
      <div className='overflow-x-auto rounded-lg border border-zinc-200/80 dark:border-zinc-700/80'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('exerciseMetrics.exercise')}</TableHead>
              <TableHead className='text-right'>
                {t('exerciseMetrics.setsReps')}
              </TableHead>
              <TableHead className='text-right'>
                {t('exerciseMetrics.averageProgress')}
              </TableHead>
              <TableHead className='text-right'>
                {t('exerciseMetrics.bestRepetition')}
              </TableHead>
              <TableHead className='text-right'>
                {t('exerciseMetrics.consistency')}
              </TableHead>
              <TableHead className='text-right'>
                {t('exerciseMetrics.fatigue')}
              </TableHead>
              <TableHead className='text-right'>
                {t('exerciseMetrics.firstToLast')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const exercise = exercises?.find((e) => e.id === row.exerciseId)
              return (
                <TableRow key={row.sessionExerciseId}>
                  <TableCell className='font-medium whitespace-nowrap'>
                    {getDisplayName(exercise)}
                  </TableCell>
                  <TableCell className='text-right tabular-nums'>
                    {row.sets} × {row.reps}
                  </TableCell>
                  <TableCell className='text-right tabular-nums'>
                    {formatPct(row.avgProgressPct)}
                  </TableCell>
                  <TableCell className='text-right tabular-nums'>
                    {formatPct(row.bestRepPct)}
                  </TableCell>
                  <TableCell className='text-right tabular-nums'>
                    {formatPoints(row.consistencySd)}
                  </TableCell>
                  <TableCell className='text-right tabular-nums'>
                    {formatPct(row.fatigueDropOffPct)}
                  </TableCell>
                  <TableCell className='text-right tabular-nums'>
                    {formatPct(row.firstToLastSetPct, true)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default SessionExerciseMetricsTable
