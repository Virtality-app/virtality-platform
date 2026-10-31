import { useState } from 'react'
import { Pause, Play, Square } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import { Spinner } from '@virtality/ui/components/spinner'
import { TooltipProvider } from '@virtality/ui/components/tooltip'
import { ConfirmDialog } from '@/components/dialogs/confirm-dialog'
import { useClientT } from '@/i18n/use-client-t'
import { type SkipDirection } from '@/lib/session-exercise-skip'
import SessionRunningSkipButton from './session-running-skip-button'
import { type SessionRunningPhase } from './session-running-status'

export interface SessionRunningTransportProps {
  phase: SessionRunningPhase
  onPauseToggle: () => void
  onEnd: () => void
  onSkip: (direction: SkipDirection) => void
  isBackSkipDisabled: boolean
  isForwardSkipDisabled: boolean
  backSkipTooltip?: string
  forwardSkipTooltip?: string
}

/**
 * Labelled, thumb-sized session controls. Pause sits in the middle and is the
 * largest target; End is set apart and always asks first.
 */
const SessionRunningTransport = ({
  phase,
  onPauseToggle,
  onEnd,
  onSkip,
  isBackSkipDisabled,
  isForwardSkipDisabled,
  backSkipTooltip,
  forwardSkipTooltip,
}: SessionRunningTransportProps) => {
  const { t } = useClientT('patient-dashboard')
  const [confirmEnd, setConfirmEnd] = useState(false)
  const isLaunching = phase === 'launching'
  const isPaused = phase === 'paused'
  const skipBlocked = phase !== 'started'

  return (
    <TooltipProvider delayDuration={200}>
      <div className='flex flex-wrap items-center gap-2'>
        <SessionRunningSkipButton
          direction='back'
          disabled={skipBlocked || isBackSkipDisabled}
          tooltip={backSkipTooltip}
          onSkip={onSkip}
        />
        <Button
          variant='primary'
          size='lg'
          className='h-14 min-w-40 flex-1 text-base'
          disabled={isLaunching}
          onClick={onPauseToggle}
        >
          {isLaunching ? (
            <Spinner className='size-5' />
          ) : isPaused ? (
            <Play className='size-5' />
          ) : (
            <Pause className='size-5' />
          )}
          {isLaunching
            ? t('controls.starting')
            : isPaused
              ? t('controls.resume')
              : t('controls.pause')}
        </Button>
        <SessionRunningSkipButton
          direction='forward'
          disabled={skipBlocked || isForwardSkipDisabled}
          tooltip={forwardSkipTooltip}
          onSkip={onSkip}
        />
        <Button
          variant='outline'
          size='lg'
          className='text-destructive hover:text-destructive border-destructive/40 hover:bg-destructive/10 h-14 text-base sm:ml-6'
          disabled={isLaunching}
          onClick={() => setConfirmEnd(true)}
        >
          <Square className='size-4 fill-current' />
          {t('controls.end')}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmEnd}
        onOpenChange={setConfirmEnd}
        title={t('endConfirm.title')}
        description={t('endConfirm.description')}
        confirmLabel={t('endConfirm.confirm')}
        cancelLabel={t('endConfirm.cancel')}
        onConfirm={onEnd}
        destructive
      />
    </TooltipProvider>
  )
}

export default SessionRunningTransport
