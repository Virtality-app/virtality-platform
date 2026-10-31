import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import { Spinner } from '@virtality/ui/components/spinner'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@virtality/ui/components/collapsible'
import { SessionCompletionSaveChoice } from '@virtality/shared/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/dialogs/confirm-dialog'
import { useClientT } from '@/i18n/use-client-t'
import { cn } from '@/lib/utils'
import SessionCompletionSummary from './session-completion-summary'
import SessionSaveChoice from './session-save-choice'
import SessionTherapiesAndNotes from './session-therapies-and-notes'
import { useSessionCompletion } from './use-session-completion'

/**
 * Session Completed: a summary and one Finish action. Program changes,
 * therapies and notes wait behind "Add details"; discarding the record is
 * set apart and confirmed.
 */
const SessionDialog = () => {
  const { t } = useClientT(['patient-dashboard', 'common'])
  const {
    isDialogOpen,
    session,
    summary,
    form,
    completionState,
    setCompletionState,
    showUpdateSourceProgram,
    isCompleting,
    finish,
    discard,
  } = useSessionCompletion()
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  // Each completed session starts with details folded away.
  useEffect(() => {
    if (!isDialogOpen) setDetailsOpen(false)
  }, [isDialogOpen])

  const needsUpdateConfirmation =
    completionState.saveChoice ===
      SessionCompletionSaveChoice.UPDATE_SOURCE_PROGRAM &&
    !completionState.showUpdateConfirmation

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        // Closing (Esc or ×) finishes the session rather than leaving it open.
        if (!open && !isCompleting) void finish()
      }}
    >
      <DialogContent
        className='flex max-h-[90vh] flex-col overflow-hidden sm:max-w-xl'
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{t('sessionDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('sessionDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <div className='scrollbar-gutter-stable min-h-0 flex-1 space-y-4 overflow-y-auto p-1 pr-3'>
          <SessionCompletionSummary summary={summary} />

          <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant='ghost'
                className='h-auto w-full justify-between px-3 py-2.5 text-left'
              >
                <span>
                  <span className='block font-medium'>
                    {detailsOpen
                      ? t('sessionDialog.hideDetails')
                      : t('sessionDialog.addDetails')}
                  </span>
                  <span className='text-muted-foreground block text-sm font-normal'>
                    {t('sessionDialog.detailsHint')}
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    'size-4 transition-transform',
                    detailsOpen && 'rotate-180',
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className='space-y-5 px-1 pt-3'>
              <SessionSaveChoice
                completionState={completionState}
                setCompletionState={setCompletionState}
                showUpdateSourceProgram={showUpdateSourceProgram}
                sourceProgramName={session?.sourceProgramName}
              />
              <SessionTherapiesAndNotes form={form} />
            </CollapsibleContent>
          </Collapsible>
        </div>

        <DialogFooter className='gap-2 sm:justify-between'>
          <Button
            type='button'
            variant='ghost'
            className='text-destructive hover:text-destructive hover:bg-destructive/10'
            disabled={isCompleting}
            onClick={() => setConfirmDiscard(true)}
          >
            {t('sessionDialog.discard')}
          </Button>
          <Button
            type='button'
            variant='primary'
            size='lg'
            disabled={isCompleting}
            onClick={() => void finish()}
          >
            {isCompleting ? <Spinner className='size-4' /> : null}
            {needsUpdateConfirmation
              ? t('common:btn.continue')
              : t('sessionDialog.finish')}
          </Button>
        </DialogFooter>
      </DialogContent>

      <ConfirmDialog
        open={confirmDiscard}
        onOpenChange={setConfirmDiscard}
        title={t('sessionDialog.discardConfirm.title')}
        description={t('sessionDialog.discardConfirm.description')}
        confirmLabel={t('sessionDialog.discardConfirm.confirm')}
        cancelLabel={t('sessionDialog.discardConfirm.cancel')}
        onConfirm={discard}
        destructive
      />
    </Dialog>
  )
}

export default SessionDialog
