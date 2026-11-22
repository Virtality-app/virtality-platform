'use client'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import {
  Language,
  MedicalHistory as MedicalHistoryType,
  Patient,
} from '@virtality/db'
import {
  getQueryClient,
  useMedicalHistory,
  useORPC,
  usePatient,
  useUpdatePatient,
} from '@virtality/react-query'
import { patientFormDefaultValues } from '@/lib/patient-form-defaults'
import { PatientFormInput, PatientFormSchema } from '@/lib/definitions'
import { BodyAreas, MedHistoryDeltas } from '@/types/models'
import { bodyAreasHaveSameSelection, parseBodyAreas } from '@/lib/body-areas'
import { notify } from '@/lib/notify'
import { cancelHref } from '@/lib/home-picker-return'
import { trackAnalyticsEvent } from '@/lib/analytics-contract'

const EMPTY_DELTAS: MedHistoryDeltas = {
  anamnesesDeltas: null,
  complaintsDeltas: null,
  expectationsDeltas: null,
  diagnosisDeltas: null,
}

/** The profile form: patient and medical history fields, body areas, save. */
export function usePatientProfileForm(patientId: string) {
  const queryClient = getQueryClient()
  const orpc = useORPC()
  const router = useRouter()

  const { data: patient } = usePatient({ patientId })
  const { data: medHistory } = useMedicalHistory({ patientId })

  const values: PatientFormInput = {
    name: patient?.name ?? '',
    email: patient?.email ?? '',
    phone: patient?.phone ?? '',
    height: patient?.height ?? '',
    weight: patient?.weight ?? '',
    dob: patient?.dob ?? undefined,
    sex: patient?.sex ?? '',
    language: patient?.language ?? '',
    occupation: patient?.occupation ?? '',
    image: patient?.image ?? null,
    anamneses: medHistory?.anamneses ?? '',
    complaints: medHistory?.complaints ?? '',
    expectations: medHistory?.expectations ?? '',
    diagnosis: medHistory?.diagnosis ?? '',
    nprs: medHistory?.nprs ?? '5',
  }

  const deltas: MedHistoryDeltas = medHistory?.deltas
    ? (JSON.parse(medHistory.deltas) as MedHistoryDeltas)
    : EMPTY_DELTAS

  const savedBodyAreas = useMemo(
    () =>
      parseBodyAreas({
        bodyFront: medHistory?.bodyFront,
        bodyBack: medHistory?.bodyBack,
      }),
    [medHistory?.bodyFront, medHistory?.bodyBack],
  )
  const [bodyAreas, setBodyAreas] = useState<BodyAreas>(savedBodyAreas)
  // A refetch after saving brings the stored selection back in.
  useEffect(() => setBodyAreas(savedBodyAreas), [savedBodyAreas])

  const form = useForm<PatientFormInput>({
    resolver: zodResolver(PatientFormSchema),
    defaultValues: patientFormDefaultValues,
    values,
  })

  const { mutate: updatePatient, isPending: isSaving } = useUpdatePatient({
    onSuccess: () => {
      trackAnalyticsEvent('patient_profile_updated', {})
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: orpc.patient.list.key() }),
        queryClient.invalidateQueries({ queryKey: orpc.patient.find.key() }),
        queryClient.invalidateQueries({
          queryKey: orpc.medicalHistory.find.key(),
        }),
      ])
    },
  })

  const save = (input: PatientFormInput) => {
    if (!patient || !medHistory) return
    const { anamneses, complaints, diagnosis, expectations, nprs } = input

    const patientData: Omit<
      Patient,
      'userId' | 'image' | 'id' | 'createdAt' | 'deletedAt' | 'pinnedAt'
    > & { image: File | string | null | undefined } = {
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      dob: input.dob ?? null,
      sex: input.sex,
      weight: input.weight ?? null,
      height: input.height ?? null,
      image: input.image ?? null,
      language: input.language as Language,
      occupation: input.occupation ?? null,
      updatedAt: new Date(),
    }

    const medicalHistoryData: Partial<MedicalHistoryType> = {
      patientId,
      anamneses,
      complaints,
      diagnosis,
      expectations,
      nprs,
      deltas: JSON.stringify(deltas),
      bodyFront: bodyAreas.front ? JSON.stringify(bodyAreas.front) : null,
      bodyBack: bodyAreas.back ? JSON.stringify(bodyAreas.back) : null,
    }

    // Runs after the hook-level onSuccess has refetched the patient, which
    // resets the form to the server values and clears isSubmitSuccessful.
    updatePatient(
      {
        data: {
          patient: { ...patient, ...patientData, id: patientId },
          medicalHistory: {
            ...medHistory,
            ...medicalHistoryData,
            id: medHistory.id,
            patientId,
          },
        },
      },
      {
        onSuccess: () => {
          notify.success({ key: 'toast.patientSaved', ns: 'patients' })
          form.reset(input, { keepDirty: false })
          // Opened from the dashboard's Session Picker: go back with the picks.
          const dashboardHref = cancelHref('')
          if (dashboardHref) router.push(dashboardHref)
        },
      },
    )
  }

  const onInvalid = () =>
    notify.error({ key: 'toast.requiredFieldsEmpty', ns: 'patients' })

  const bodyAreasDirty = !bodyAreasHaveSameSelection(savedBodyAreas, bodyAreas)

  return {
    patient,
    form,
    deltas,
    bodyAreas,
    setBodyAreas,
    clearBodyAreas: () => setBodyAreas({ front: null, back: null }),
    isDirty: form.formState.isDirty || bodyAreasDirty,
    hasErrors: Object.keys(form.formState.errors).length > 0,
    isSaving,
    onSubmit: form.handleSubmit(save, onInvalid),
  }
}
