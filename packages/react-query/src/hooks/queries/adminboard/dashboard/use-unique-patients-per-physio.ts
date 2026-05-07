import { useQuery } from '@tanstack/react-query'
import { useORPC } from '../../../../orpc-context.js'

export function useUniquePatientsPerPhysio() {
  const orpc = useORPC()
  return useQuery(orpc.dashboard.getUniquePatientsPerPhysio.queryOptions())
}
