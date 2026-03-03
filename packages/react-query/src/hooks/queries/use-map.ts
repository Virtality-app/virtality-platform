import { useQuery } from '@tanstack/react-query'
import { useORPC } from '../../orpc-context.js'

export function useMap() {
  const orpc = useORPC()
  return useQuery(orpc.map.list.queryOptions({ staleTime: 'static' }))
}
