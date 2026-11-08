import { Label } from '@virtality/ui/components/label'
import { Textarea } from '@virtality/ui/components/textarea'
import { useClientT } from '@/i18n/use-client-t'
import type { SessionCompletionForm } from './use-session-completion'

interface SessionNotesProps {
  form: SessionCompletionForm
}

/** Free-text notes for the session that just ended. */
const SessionNotes = ({ form }: SessionNotesProps) => {
  const { t } = useClientT('patient-dashboard')

  return (
    <div className='space-y-2'>
      <Label htmlFor='session-notes'>{t('sessionDialog.notes')}</Label>
      <Textarea
        id='session-notes'
        value={form.watch('notes') ?? ''}
        onChange={(e) => form.setValue('notes', e.target.value)}
        placeholder={t('sessionDialog.notesPlaceholder')}
      />
    </div>
  )
}

export default SessionNotes
