'use client'

import { NotebookPen } from 'lucide-react'
import { useClientT } from '@/i18n/use-client-t'

/** Marks a session that has notes, labelled in the current language. */
const SessionNotesIcon = () => {
  const { t } = useClientT('patients')
  return (
    <NotebookPen
      className='text-muted-foreground size-4'
      aria-label={t('sessionsTable.hasNotes')}
    />
  )
}

export default SessionNotesIcon
