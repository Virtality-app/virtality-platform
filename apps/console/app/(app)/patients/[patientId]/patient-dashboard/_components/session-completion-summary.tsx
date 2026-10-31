import { useClientT } from '@/i18n/use-client-t'
import type { SessionCompletionSummary as Summary } from '@/lib/session-completion-summary'

/** Duration, exercises and reps for the session that just ended. */
const SessionCompletionSummary = ({ summary }: { summary: Summary | null }) => {
  const { t } = useClientT('patient-dashboard')
  if (!summary) return null

  const duration =
    summary.durationMinutes === null || summary.durationMinutes < 1
      ? t('sessionDialog.summary.durationUnknown')
      : t('sessionDialog.summary.minutes', { count: summary.durationMinutes })

  const stats = [
    { label: t('sessionDialog.summary.duration'), value: duration },
    {
      label: t('sessionDialog.summary.exercises'),
      value: t('sessionDialog.summary.exercisesValue', {
        done: summary.exercisesWithProgress,
        total: summary.exercisesPlanned,
      }),
    },
    {
      label: t('sessionDialog.summary.reps'),
      value: String(summary.repsRecorded),
    },
  ]

  return (
    <dl
      aria-label={t('sessionDialog.summary.label')}
      className='bg-muted/40 grid grid-cols-1 gap-3 rounded-lg border p-4 sm:grid-cols-3'
    >
      {stats.map((stat) => (
        <div key={stat.label} className='min-w-0'>
          <dt className='text-muted-foreground text-sm'>{stat.label}</dt>
          <dd className='mt-1 text-xl font-semibold tabular-nums'>
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export default SessionCompletionSummary
