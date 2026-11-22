'use client'
import { useWatch, type UseFormReturn } from 'react-hook-form'
import { PatientFormInput } from '@/lib/definitions'
import { useClientT } from '@/i18n/use-client-t'
import PatientProfileAvatar from '@/app/(app)/patients/_components/patient-profile-avatar'

/** Photo and the name as it's typed, with a hint on what to fill in. */
const NewPatientHeader = ({
  form,
}: {
  form: UseFormReturn<PatientFormInput>
}) => {
  const { t } = useClientT('patients')
  const name = useWatch({ control: form.control, name: 'name' }) ?? ''

  return (
    <div className='flex flex-wrap items-center gap-5 rounded-xl border border-zinc-200 bg-white px-6 py-5.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900'>
      <PatientProfileAvatar form={form} name={name} />
      <div className='flex min-w-55 flex-1 flex-col gap-1.5'>
        <h1 className='ph-sensitive text-[22px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50'>
          {name.trim() || t('list.newPatient')}
        </h1>
        <p className='text-[13px] text-zinc-500 dark:text-zinc-400'>
          {t('profile.newPatientHint')}
        </p>
      </div>
    </div>
  )
}

export default NewPatientHeader
