import { Button } from '@virtality/ui/components/button'
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useClientT } from '@/i18n/use-client-t'

interface SessionDiscardViewProps {
  onKeep: () => void
  onDiscard: () => void
}

/**
 * The Session Completed dialog's discard step, shown in place of the
 * summary. "Keep record" takes focus and returns to the summary.
 */
const SessionDiscardView = ({ onKeep, onDiscard }: SessionDiscardViewProps) => {
  const { t } = useClientT('patient-dashboard')

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('sessionDialog.discardConfirm.title')}</DialogTitle>
        <DialogDescription>
          {t('sessionDialog.discardConfirm.description')}
        </DialogDescription>
      </DialogHeader>

      <DialogFooter className='gap-2'>
        <Button
          type='button'
          variant='outline'
          size='lg'
          autoFocus
          onClick={onKeep}
        >
          {t('sessionDialog.discardConfirm.cancel')}
        </Button>
        <Button
          type='button'
          variant='destructive'
          size='lg'
          onClick={onDiscard}
        >
          {t('sessionDialog.discardConfirm.confirm')}
        </Button>
      </DialogFooter>
    </>
  )
}

export default SessionDiscardView
