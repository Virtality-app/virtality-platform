'use client'

import { Button } from '@virtality/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  getQueryClient,
  useORPC,
  useRetireReusableProgram,
} from '@virtality/react-query'
import { useClientT } from '@/i18n/use-client-t'

/** Confirms, then retires a program ("Delete"); shared by the Programs list and the Session Picker. */
const RetireProgramDialog = ({
  programId,
  open,
  onOpenChange,
  onRetired,
}: {
  programId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onRetired?: (programId: string) => void
}) => {
  const queryClient = getQueryClient()
  const orpc = useORPC()
  const { t } = useClientT(['programs', 'common'])

  const { mutate: retireProgram, isPending } = useRetireReusableProgram({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.reusableProgram.list.key(),
      })
      onRetired?.(programId)
      onOpenChange(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('retire.title')}</DialogTitle>
          <DialogDescription>{t('retire.description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('common:btn.cancel')}
          </Button>
          <Button
            variant='destructive'
            disabled={isPending}
            onClick={() => retireProgram({ id: programId })}
          >
            {t('retire.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RetireProgramDialog
