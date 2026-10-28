import { Button } from '@virtality/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useClientT } from '@/i18n/use-client-t'

type CastingTimeoutPromptProps = {
  open: boolean
  onWait: () => void
  onCancel: () => void
}

export function CastingTimeoutPrompt({
  open,
  onWait,
  onCancel,
}: CastingTimeoutPromptProps) {
  const { t } = useClientT(['patient-dashboard', 'common'])
  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t('casting.timeoutTitle')}</DialogTitle>
          <DialogDescription>
            {t('casting.timeoutDescription')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={onWait}>
            {t('casting.wait')}
          </Button>
          <Button variant='destructive' onClick={onCancel}>
            {t('common:btn.cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
