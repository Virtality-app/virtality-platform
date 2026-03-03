import { useQuery } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.js'

export function useWaitlist() {
  const orpc = useORPC()
  return useQuery(orpc.waitlist.list.queryOptions())
}
