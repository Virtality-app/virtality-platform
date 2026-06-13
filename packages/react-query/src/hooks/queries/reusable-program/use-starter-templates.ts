import { useQuery } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.js'

export function useStarterTemplates() {
  const orpc = useORPC()
  return useQuery(orpc.reusableProgram.listStarterTemplates.queryOptions())
}
