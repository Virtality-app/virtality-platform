import { SkipBack, SkipForward } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@virtality/ui/components/tooltip'
import { useClientT } from '@/i18n/use-client-t'
import { type SkipDirection } from '@/lib/session-exercise-skip'

interface SessionRunningSkipButtonProps {
  direction: SkipDirection
  disabled: boolean
  /** Why the skip is blocked (a pending exercise change), shown on hover. */
  tooltip?: string
  onSkip: (direction: SkipDirection) => void
}

const SessionRunningSkipButton = ({
  direction,
  disabled,
  tooltip,
  onSkip,
}: SessionRunningSkipButtonProps) => {
  const { t } = useClientT('patient-dashboard')
  const isForward = direction === 'forward'

  const button = (
    <Button
      variant='outline'
      size='lg'
      className='h-14 text-base'
      disabled={disabled}
      aria-label={t(isForward ? 'controls.skipNext' : 'controls.skipPrevious')}
      onClick={() => onSkip(direction)}
    >
      {isForward ? null : <SkipBack className='size-5' />}
      {t(isForward ? 'controls.next' : 'controls.previous')}
      {isForward ? <SkipForward className='size-5' /> : null}
    </Button>
  )

  if (!tooltip || !disabled) return button

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className='inline-flex' tabIndex={0}>
          {button}
        </span>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

export default SessionRunningSkipButton
