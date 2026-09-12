import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { ImmersiveVideoAdminRow } from '@virtality/orpc/client'
import { useORPC } from '../../../orpc-context.js'

export function useImmersiveVideoCatalog(): UseQueryResult<
  ImmersiveVideoAdminRow[]
> {
  const orpc = useORPC()
  return useQuery(orpc.immersiveVideo.listCatalog.queryOptions())
}
