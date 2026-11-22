'use client'
import { useRef } from 'react'
import dynamic from 'next/dynamic'
import { FileText } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import { FormField } from '@/components/ui/form'
import { PatientFormInput } from '@/lib/definitions'
import { MedHistoryDeltas } from '@/types/models'
import { useClientT } from '@/i18n/use-client-t'
import ProfileSectionCard from './profile-section-card'
import ClinicalNoteLoading from './clinical-note-loading'
import NprsField from './nprs-field'

const Editor = dynamic(() => import('@/editor'), {
  ssr: false,
  loading: ClinicalNoteLoading,
})

type ClinicalNotesCardProps = {
  form: UseFormReturn<PatientFormInput>
  deltas: MedHistoryDeltas
}

/** The rich-text medical history fields and the pain scale. */
const ClinicalNotesCard = ({ form, deltas }: ClinicalNotesCardProps) => {
  const { t } = useClientT('patients')
  const quillRef = useRef(undefined)

  const fields = [
    {
      name: 'anamneses',
      label: t('medicalHistory.anamneses'),
      deltas: deltas.anamnesesDeltas,
    },
    {
      name: 'complaints',
      label: t('medicalHistory.complaints'),
      deltas: deltas.complaintsDeltas,
    },
    {
      name: 'expectations',
      label: t('medicalHistory.expectations'),
      deltas: deltas.expectationsDeltas,
    },
    {
      name: 'diagnosis',
      label: t('medicalHistory.diagnosis'),
      deltas: deltas.diagnosisDeltas,
    },
  ] as const

  return (
    <ProfileSectionCard
      icon={<FileText />}
      title={t('profile.clinicalNotes')}
      contentClassName='flex flex-col gap-4'
    >
      {fields.map((field) => (
        <FormField
          key={field.name}
          name={field.name}
          label={field.label}
          control={form.control}
        >
          {(control) => (
            <Editor
              readOnly={false}
              ref={quillRef}
              deltasRef={field.deltas}
              defaultValue={control.value ?? ''}
              onChange={control.onChange}
            />
          )}
        </FormField>
      ))}
      <NprsField form={form} label={t('medicalHistory.nprs')} />
    </ProfileSectionCard>
  )
}

export default ClinicalNotesCard
