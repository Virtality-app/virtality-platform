'use client'
import { Loader2, Save, Trash2 } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import { useClientT } from '@/i18n/use-client-t'
import StickyActionBar from '@/app/(app)/patients/_components/sticky-action-bar'
import UnsavedChangesNote from '@/app/(app)/patients/_components/unsaved-changes-note'
import ProfileDeletePrompt from './profile-delete-prompt'

type ProfileActionBarProps = {
  formId: string
  patientName: string
  isDirty: boolean
  isSaving: boolean
  isDeleting: boolean
  isConfirmingDelete: boolean
  onAskDelete: () => void
  onCancelDelete: () => void
  onConfirmDelete: () => void
  /** Shown when the profile was opened from the dashboard's Session Picker. */
  onCancel?: () => void
}

/** Profile footer: unsaved state or the delete prompt, then Cancel, Delete and Save. */
const ProfileActionBar = ({
  formId,
  patientName,
  isDirty,
  isSaving,
  isDeleting,
  isConfirmingDelete,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
  onCancel,
}: ProfileActionBarProps) => {
  const { t } = useClientT(['patients', 'common'])

  const status = isConfirmingDelete ? (
    <ProfileDeletePrompt
      patientName={patientName}
      onCancel={onCancelDelete}
      onConfirm={onConfirmDelete}
    />
  ) : (
    isDirty && <UnsavedChangesNote />
  )

  return (
    <StickyActionBar status={status}>
      {onCancel && (
        <Button type='button' variant='outline' onClick={onCancel}>
          {t('btn.cancel', { ns: 'common' })}
        </Button>
      )}
      <Button
        type='button'
        variant='outline'
        onClick={onAskDelete}
        disabled={isDeleting || isConfirmingDelete}
        className='text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/50 dark:hover:text-red-300'
      >
        {isDeleting ? <Loader2 className='animate-spin' /> : <Trash2 />}
        {t('btn.delete', { ns: 'common' })}
      </Button>
      <Button type='submit' form={formId} variant='primary' disabled={isSaving}>
        {isSaving ? <Loader2 className='animate-spin' /> : <Save />}
        {t('profile.saveChanges')}
      </Button>
    </StickyActionBar>
  )
}

export default ProfileActionBar
