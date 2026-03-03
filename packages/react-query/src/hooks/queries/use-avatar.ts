import { useQuery } from '@tanstack/react-query'
import { useORPC } from '../../orpc-context.js'

export function useAvatar() {
  const orpc = useORPC()
  return useQuery(orpc.avatar.list.queryOptions({ staleTime: 'static' }))
}
