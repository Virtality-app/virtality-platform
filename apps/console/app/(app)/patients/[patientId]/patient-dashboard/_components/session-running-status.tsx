import { useClientT } from '@/i18n/use-client-t'
import { cn } from '@/lib/utils'

export type SessionRunningPhase = 'launching' | 'started' | 'paused'

const PHASE_LABEL_KEY: Record<SessionRunningPhase, string> = {
  launching: 'running.launching',
  started: 'running.live',
  paused: 'running.paused',
}

const PHASE_DOT_CLASS: Record<SessionRunningPhase, string> = {
  launching: 'bg-amber-400 motion-safe:animate-pulse',
  started: 'bg-emerald-400 motion-safe:animate-pulse',
  paused: 'bg-zinc-400',
}

interface SessionRunningStatusProps {
  phase: SessionRunningPhase
  exerciseNumber: number
  exerciseCount: number
}

/** Session state and position in the program, read at a glance. */
const SessionRunningStatus = ({
  phase,
  exerciseNumber,
  exerciseCount,
}: SessionRunningStatusProps) => {
  const { t } = useClientT('patient-dashboard')

  return (
    <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-1'>
      <p
        className='flex items-center gap-2 text-sm font-medium'
        role='status'
        aria-live='polite'
      >
        <span
          aria-hidden
          className={cn('size-2.5 rounded-full', PHASE_DOT_CLASS[phase])}
        />
        {t(PHASE_LABEL_KEY[phase])}
      </p>
      {exerciseCount > 0 && (
        <p className='text-muted-foreground text-sm tabular-nums'>
          {t('running.exerciseOf', {
            current: exerciseNumber,
            total: exerciseCount,
          })}
        </p>
      )}
    </div>
  )
}

export default SessionRunningStatus
