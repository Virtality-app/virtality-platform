import { useQuery } from '@tanstack/react-query'
import { useORPC } from '../../orpc-context.js'

interface UseMedicalHistoryProps {
  patientId: string
}

export function useMedicalHistory({ patientId }: UseMedicalHistoryProps) {
  const orpc = useORPC()
  return useQuery(
    orpc.medicalHistory.find.queryOptions({
      input: { where: { patientId } },
    }),
  )
}
