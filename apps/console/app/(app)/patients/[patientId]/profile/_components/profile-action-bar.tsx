'use client'
import { Loader2, Save, Trash2 } from 'lucide-react'
import { Trans } from 'react-i18next'
import { Button } from '@virtality/ui/components/button'
import { useClientT } from '@/i18n/use-client-t'

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

/** Sticky footer: unsaved state or the delete prompt on the left, actions on the right. */
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

  return (
    <div className='sticky bottom-0 z-20 border-t border-zinc-200 bg-white/90 px-6 py-3.5 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90'>
      <div className='mx-auto flex max-w-280 flex-wrap items-center gap-3'>
        {isConfirmingDelete ? (
          <div className='flex flex-wrap items-center gap-2.5'>
            <span className='text-[13.5px] text-zinc-700 dark:text-zinc-300'>
              <Trans
                t={t}
                ns='patients'
                i18nKey='profile.deletePrompt'
                values={{ name: patientName }}
                components={{ strong: <strong className='ph-sensitive' /> }}
              />
            </span>
            <Button type='button' variant='outline' onClick={onCancelDelete}>
              {t('btn.cancel', { ns: 'common' })}
            </Button>
            <Button
              type='button'
              variant='destructive'
              onClick={onConfirmDelete}
            >
              {t('profile.confirmDelete')}
            </Button>
          </div>
        ) : (
          isDirty && (
            <span className='flex items-center gap-1.5 text-[13px] text-zinc-500 dark:text-zinc-400'>
              <span className='size-1.75 rounded-full bg-amber-500' />
              {t('profile.unsavedChanges')}
            </span>
          )
        )}

        <div className='ml-auto flex items-center gap-2.5'>
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
          <Button
            type='submit'
            form={formId}
            variant='primary'
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className='animate-spin' /> : <Save />}
            {t('profile.saveChanges')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ProfileActionBar
