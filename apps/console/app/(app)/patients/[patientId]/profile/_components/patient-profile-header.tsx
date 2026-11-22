'use client'
import { format } from 'date-fns'
import { Mail, Phone, User } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import type { Patient } from '@virtality/db'
import { PatientFormInput } from '@/lib/definitions'
import { ageFromDob } from '@/lib/patient-profile-summary'
import { useClientT } from '@/i18n/use-client-t'
import { useDateFnsLocale } from '@/hooks/use-date-fns-locale'
import PatientProfileAvatar from './patient-profile-avatar'
import ProfileMetaPill from './profile-meta-pill'
import ProfileStat from './profile-stat'
import { usePatientSessionSummary } from './use-patient-session-summary'

type PatientProfileHeaderProps = {
  form: UseFormReturn<PatientFormInput>
  patient: Patient
}

/** Who the patient is at a glance: photo, name, key facts and session stats. */
const PatientProfileHeader = ({ form, patient }: PatientProfileHeaderProps) => {
  const { t } = useClientT(['patients', 'common'])
  const locale = useDateFnsLocale()
  const { sessionCount, lastVisitAt } = usePatientSessionSummary(patient.id)

  const age = ageFromDob(patient.dob)
  const sex =
    patient.sex === 'male' || patient.sex === 'female'
      ? t(`form.${patient.sex}`, { ns: 'common' })
      : null
  const ageAndSex = [
    age !== null ? t('profile.ageYears', { age }) : null,
    sex,
  ].filter(Boolean)

  return (
    <div className='flex flex-wrap items-center gap-5 rounded-xl border border-zinc-200 bg-white px-6 py-5.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900'>
      <PatientProfileAvatar form={form} patient={patient} />

      <div className='flex min-w-55 flex-1 flex-col gap-2'>
        <h1 className='ph-sensitive text-[22px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50'>
          {patient.name}
        </h1>
        <div className='ph-sensitive flex flex-wrap items-center gap-2'>
          {ageAndSex.length > 0 && (
            <ProfileMetaPill icon={<User />}>
              {ageAndSex.join(' · ')}
            </ProfileMetaPill>
          )}
          {patient.email && (
            <ProfileMetaPill icon={<Mail />}>{patient.email}</ProfileMetaPill>
          )}
          {patient.phone && (
            <ProfileMetaPill icon={<Phone />}>{patient.phone}</ProfileMetaPill>
          )}
        </div>
      </div>

      <div className='flex items-center border-zinc-200 max-sm:-ml-4 sm:border-l dark:border-zinc-700'>
        <ProfileStat
          value={
            sessionCount === undefined
              ? t('profile.noValue')
              : String(sessionCount)
          }
          label={t('profile.sessionsStat')}
        />
        <ProfileStat
          className='pr-0'
          value={
            lastVisitAt
              ? format(lastVisitAt, 'MMM d', { locale })
              : t('profile.noValue')
          }
          label={t('profile.lastVisit')}
        />
      </div>
    </div>
  )
}

export default PatientProfileHeader
