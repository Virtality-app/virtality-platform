'use client'
import { useClientT } from '@/i18n/use-client-t'

/** Shown while the rich-text editor's bundle loads. */
const ClinicalNoteLoading = () => {
  const { t } = useClientT('patients')
  return (
    <p className='text-sm text-zinc-500 dark:text-zinc-400'>
      {t('medicalHistory.loading')}
    </p>
  )
}

export default ClinicalNoteLoading
