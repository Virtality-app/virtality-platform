import { useQuery } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.js'

export function useReusablePrograms() {
  const orpc = useORPC()
  return useQuery(orpc.reusableProgram.list.queryOptions())
}
