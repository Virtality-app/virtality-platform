'use client'

import { Button } from '@virtality/ui/components/button'
import { Textarea } from '@virtality/ui/components/textarea'
import { ExtendedPatientSession } from '@/types/models'
import {
  getQueryClient,
  useORPC,
  useUpdatePatientSession,
} from '@virtality/react-query'
import { useState } from 'react'
import { notify } from '@/lib/notify'
import { trackAnalyticsEvent } from '@/lib/analytics-contract'
import { useClientT } from '@/i18n/use-client-t'

const SessionCardNotes = ({
  session,
  patientId,
}: {
  session: ExtendedPatientSession
  patientId: string
}) => {
  const { t } = useClientT(['patients', 'common'])
  const queryClient = getQueryClient()
  const orpc = useORPC()
  const [notes, setNotes] = useState(session?.notes ?? '')
  const [isEditing, setIsEditing] = useState(false)

  const { mutate: updatePatientSession, isPending } = useUpdatePatientSession({
    onSuccess: () => {
      notify.success({ key: 'toast.notesUpdated', ns: 'patients' })

      trackAnalyticsEvent('session_notes_saved', {
        session_id: session.id,
        notes_length: notes.length,
      })

      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: orpc.patientSession.list.key({
            input: { where: { patientId } },
          }),
        }),
        queryClient.invalidateQueries({
          queryKey: orpc.patientSession.find.key({
            input: { where: { id: session.id } },
          }),
        }),
      ])
    },
  })

  const handleSaveNotes = () => {
    updatePatientSession({ id: session.id, notes })
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  return (
    <div>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='font-medium'>{t('session.notes.title')}</h3>
        {!isEditing ? (
          <Button
            variant='outline'
            size='sm'
            onClick={() => setIsEditing(true)}
          >
            {t('session.notes.edit')}
          </Button>
        ) : (
          <div className='flex gap-2'>
            <Button variant='outline' size='sm' onClick={handleCancelEdit}>
              {t('btn.cancel', { ns: 'common' })}
            </Button>
            <Button size='sm' onClick={handleSaveNotes} disabled={isPending}>
              {t('btn.save', { ns: 'common' })}
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('session.notes.placeholder')}
          className='min-h-30 resize-none'
        />
      ) : (
        <div className='bg-muted/30 min-h-30 rounded-lg p-4'>
          {notes ? (
            <p className='text-sm leading-relaxed whitespace-pre-wrap'>
              {notes}
            </p>
          ) : (
            <p className='text-muted-foreground text-sm italic'>
              {t('session.notes.empty')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default SessionCardNotes
