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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useClientT } from '@/i18n/use-client-t'
import { cn } from '@/lib/utils'
import SessionCompletionSummary from './session-completion-summary'
import SessionNotes from './session-notes'
import SessionSaveChoice from './session-save-choice'
import SessionSupplementalTherapies from './session-supplemental-therapies'
import { type useSessionCompletion } from './use-session-completion'

type SessionCompletion = ReturnType<typeof useSessionCompletion>

interface SessionCompletedViewProps {
  completion: SessionCompletion
  detailsOpen: boolean
  onDetailsOpenChange: (open: boolean) => void
  onRequestDiscard: () => void
}

/** Summary, supplemental therapies, optional details and the Finish action. */
const SessionCompletedView = ({
  completion,
  detailsOpen,
  onDetailsOpenChange,
  onRequestDiscard,
}: SessionCompletedViewProps) => {
  const { t } = useClientT(['patient-dashboard', 'common'])
  const {
    session,
    summary,
    form,
    completionState,
    setCompletionState,
    showUpdateSourceProgram,
    isCompleting,
    finish,
  } = completion

  const needsUpdateConfirmation =
    completionState.saveChoice ===
      SessionCompletionSaveChoice.UPDATE_SOURCE_PROGRAM &&
    !completionState.showUpdateConfirmation

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('sessionDialog.title')}</DialogTitle>
        <DialogDescription>{t('sessionDialog.description')}</DialogDescription>
      </DialogHeader>

      <div className='scrollbar-gutter-stable min-h-0 flex-1 space-y-4 overflow-y-auto p-1 pr-3'>
        <SessionCompletionSummary summary={summary} />
        <SessionSupplementalTherapies form={form} />

        <Collapsible open={detailsOpen} onOpenChange={onDetailsOpenChange}>
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
            <SessionNotes form={form} />
          </CollapsibleContent>
        </Collapsible>
      </div>

      <DialogFooter className='gap-2 sm:justify-between'>
        <Button
          type='button'
          variant='ghost'
          className='text-destructive hover:text-destructive hover:bg-destructive/10'
          disabled={isCompleting}
          onClick={onRequestDiscard}
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
    </>
  )
}

export default SessionCompletedView
