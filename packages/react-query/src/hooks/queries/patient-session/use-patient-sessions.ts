import { useQuery } from '@tanstack/react-query'
import type { PatientSessionFindManyArgs } from '@virtality/db'
import { useORPC } from '../../../orpc-context.js'

interface UsePatientSessionsProps {
  input: PatientSessionFindManyArgs
}

export function usePatientSessions({ input }: UsePatientSessionsProps) {
  const orpc = useORPC()
  return useQuery(orpc.patientSession.list.queryOptions({ input }))
}
