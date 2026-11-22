'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import {
  Language,
  MedicalHistory as MedicalHistoryType,
  Patient,
} from '@virtality/db'
import { getQueryClient, useNewPatient, useORPC } from '@virtality/react-query'
import { patientFormDefaultValues } from '@/lib/patient-form-defaults'
import { PatientFormInput, PatientFormSchema } from '@/lib/definitions'
import { BodyAreas, MedHistoryDeltas } from '@/types/models'
import { markedBodyAreas } from '@/lib/body-areas'
import { getUUID } from '@/lib/utils'
import { notify } from '@/lib/notify'
import { afterCreateHref } from '@/lib/home-picker-return'
import { trackAnalyticsEvent } from '@/lib/analytics-contract'
import useNow from '@/hooks/use-now'

export const NO_DELTAS: MedHistoryDeltas = {
  anamnesesDeltas: null,
  complaintsDeltas: null,
  expectationsDeltas: null,
  diagnosisDeltas: null,
}

/** New patient: the form, body areas and create. */
export function useNewPatientForm() {
  const queryClient = getQueryClient()
  const orpc = useORPC()
  const router = useRouter()
  const { ts, now } = useNow()
  const [bodyAreas, setBodyAreas] = useState<BodyAreas>({
    front: null,
    back: null,
  })

  const form = useForm<PatientFormInput>({
    resolver: zodResolver(PatientFormSchema),
    defaultValues: patientFormDefaultValues,
  })

  const { mutate: createPatient, isPending: isCreating } = useNewPatient({
    onSuccess: (_data, variables) => {
      trackAnalyticsEvent('patient_created', {
        time_spent_sec: (now() - ts.current) / 1000,
      })
      queryClient.invalidateQueries({ queryKey: orpc.patient.list.key() })
      router.push(
        afterCreateHref('patientId', variables.data.patient.id, '/patients'),
      )
    },
  })

  const create = (input: PatientFormInput) => {
    const patient: Omit<Patient, 'userId' | 'image'> & {
      image: File | string | null | undefined
    } = {
      id: getUUID(),
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      dob: input.dob ?? null,
      sex: input.sex,
      weight: input.weight ?? null,
      height: input.height ?? null,
      image: input.image,
      language: input.language as Language,
      occupation: input.occupation ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      pinnedAt: null,
    }

    const medicalHistory: MedicalHistoryType = {
      id: getUUID(),
      patientId: patient.id,
      anamneses: input.anamneses,
      complaints: input.complaints,
      diagnosis: input.diagnosis,
      expectations: input.expectations,
      nprs: input.nprs,
      deltas: JSON.stringify(NO_DELTAS),
      bodyFront: bodyAreas.front ? JSON.stringify(bodyAreas.front) : null,
      bodyBack: bodyAreas.back ? JSON.stringify(bodyAreas.back) : null,
    }

    createPatient({ data: { patient, medicalHistory } })
  }

  const onInvalid = () =>
    notify.error({ key: 'toast.requiredFieldsEmpty', ns: 'patients' })

  return {
    form,
    bodyAreas,
    setBodyAreas,
    clearBodyAreas: () => setBodyAreas({ front: null, back: null }),
    isDirty: form.formState.isDirty || markedBodyAreas(bodyAreas).length > 0,
    hasErrors: Object.keys(form.formState.errors).length > 0,
    isCreating,
    onSubmit: form.handleSubmit(create, onInvalid),
  }
}
