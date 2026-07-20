import { useQuery } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.js'

export function useMosaic() {
  const orpc = useORPC()
  return useQuery(orpc.mosaic.get.queryOptions())
}
