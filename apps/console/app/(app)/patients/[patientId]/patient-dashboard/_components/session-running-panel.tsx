import { type ReactNode } from 'react'
import { useClientT } from '@/i18n/use-client-t'
import { cn } from '@/lib/utils'
import SessionRunningStatus, {
  type SessionRunningPhase,
} from './session-running-status'
import SessionRunningCounter from './session-running-counter'
import SessionRunningTransport, {
  type SessionRunningTransportProps,
} from './session-running-transport'

interface SessionRunningPanelProps extends Omit<
  SessionRunningTransportProps,
  'phase'
> {
  className?: string
  phase: SessionRunningPhase
  exerciseName: string | null
  exerciseNumber: number
  exerciseCount: number
  currentSet: number
  totalSets: number
  currentRep: number
  totalReps: number
  /** Pending headset exercise change, shown under the exercise name. */
  changeStatus?: ReactNode
}

/**
 * What the clinician needs mid-treatment, in one place: the exercise, the
 * set and rep counts in large type, and labelled controls.
 */
const SessionRunningPanel = ({
  className,
  phase,
  exerciseName,
  exerciseNumber,
  exerciseCount,
  currentSet,
  totalSets,
  currentRep,
  totalReps,
  changeStatus,
  ...transport
}: SessionRunningPanelProps) => {
  const { t } = useClientT('patient-dashboard')

  return (
    <section
      aria-label={t('running.label')}
      className={cn(
        'bg-card rounded-xl border p-4 shadow sm:p-6',
        phase === 'started' && 'border-emerald-500/40',
        className,
      )}
    >
      <SessionRunningStatus
        phase={phase}
        exerciseNumber={exerciseNumber}
        exerciseCount={exerciseCount}
      />

      <div className='mt-3 flex flex-wrap items-end justify-between gap-x-8 gap-y-4'>
        <div className='min-w-0 flex-1 basis-64'>
          <h2 className='text-2xl font-semibold text-balance sm:text-3xl'>
            {exerciseName ?? '—'}
          </h2>
          {changeStatus ? <div className='mt-2'>{changeStatus}</div> : null}
        </div>
        <div className='flex gap-8'>
          <SessionRunningCounter
            label={t('running.set')}
            current={currentSet}
            total={totalSets}
          />
          <SessionRunningCounter
            label={t('running.rep')}
            current={currentRep}
            total={totalReps}
          />
        </div>
      </div>

      <div className='mt-6'>
        <SessionRunningTransport phase={phase} {...transport} />
      </div>
    </section>
  )
}

export default SessionRunningPanel
