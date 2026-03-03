import { skipToken, useQuery } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.js'

interface UsePatientProps {
  patientId?: string
}

export function usePatient({ patientId }: UsePatientProps) {
  const orpc = useORPC()
  return useQuery(
    orpc.patient.find.queryOptions({
      input: patientId ? { id: patientId } : skipToken,
    }),
  )
}
