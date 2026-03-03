import { useQuery } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.js'

export function useUserName() {
  const orpc = useORPC()
  return useQuery(orpc.user.findUserName.queryOptions())
}
