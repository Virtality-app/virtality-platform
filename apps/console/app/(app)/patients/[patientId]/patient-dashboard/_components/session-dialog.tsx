import { useEffect, useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import SessionCompletedView from './session-completed-view'
import SessionDiscardView from './session-discard-view'
import { useSessionCompletion } from './use-session-completion'

type SessionDialogView = 'completed' | 'discard'

/**
 * Session Completed: a summary, the supplemental therapies and one Finish
 * action. Program changes and notes wait behind "Add details". Discarding the record swaps
 * the dialog to a confirmation in place; "Keep record" swaps it back with
 * everything entered so far intact.
 */
const SessionDialog = () => {
  const completion = useSessionCompletion()
  const { isDialogOpen, isCompleting, finish, discard } = completion
  const [view, setView] = useState<SessionDialogView>('completed')
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Each completed session starts on the summary with details folded away.
  useEffect(() => {
    if (isDialogOpen) return
    setView('completed')
    setDetailsOpen(false)
  }, [isDialogOpen])

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        if (open) return
        // Esc or × backs out of the discard step; on the summary it finishes
        // the session rather than leaving it open.
        if (view === 'discard') setView('completed')
        else if (!isCompleting) void finish()
      }}
    >
      <DialogContent
        className='flex max-h-[90vh] flex-col overflow-hidden sm:max-w-xl'
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        {view === 'discard' ? (
          <SessionDiscardView
            onKeep={() => setView('completed')}
            onDiscard={discard}
          />
        ) : (
          <SessionCompletedView
            completion={completion}
            detailsOpen={detailsOpen}
            onDetailsOpenChange={setDetailsOpen}
            onRequestDiscard={() => setView('discard')}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

export default SessionDialog
