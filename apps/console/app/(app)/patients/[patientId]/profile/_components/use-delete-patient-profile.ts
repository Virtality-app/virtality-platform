'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Patient } from '@virtality/db'
import {
  getQueryClient,
  useDeletePatient,
  useORPC,
} from '@virtality/react-query'
import { trackAnalyticsEvent } from '@/lib/analytics-contract'

/** Delete from the action bar: ask inline first, then delete and leave. */
export function useDeletePatientProfile(patient: Patient | undefined) {
  const queryClient = getQueryClient()
  const orpc = useORPC()
  const router = useRouter()
  const [isConfirming, setConfirming] = useState(false)

  const { mutate: deletePatient, isPending: isDeleting } = useDeletePatient({
    onSuccess: () => {
      trackAnalyticsEvent('patient_deleted', {})
      queryClient.invalidateQueries({ queryKey: orpc.patient.list.key() })
      router.push('/patients')
    },
  })

  return {
    isConfirming,
    isDeleting,
    askToDelete: () => setConfirming(true),
    cancelDelete: () => setConfirming(false),
    confirmDelete: () => {
      if (!patient) return
      setConfirming(false)
      deletePatient(patient)
    },
  }
}
