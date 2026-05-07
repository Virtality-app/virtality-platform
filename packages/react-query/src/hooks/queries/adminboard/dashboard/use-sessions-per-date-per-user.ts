import { useQuery } from '@tanstack/react-query'
import { useORPC } from '../../../../orpc-context.js'

export function usePatientSessionsPerDatePerUser() {
  const orpc = useORPC()
  return useQuery(
    orpc.dashboard.getPatientSessionsPerDatePerUser.queryOptions(),
  )
}
