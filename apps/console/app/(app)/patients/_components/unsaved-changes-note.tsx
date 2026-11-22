'use client'
import { useClientT } from '@/i18n/use-client-t'

/** The amber dot and "Unsaved changes" shown in the action bar. */
const UnsavedChangesNote = () => {
  const { t } = useClientT('patients')
  return (
    <span className='flex items-center gap-1.5 text-[13px] text-zinc-500 dark:text-zinc-400'>
      <span className='size-1.75 rounded-full bg-amber-500' />
      {t('profile.unsavedChanges')}
    </span>
  )
}

export default UnsavedChangesNote
