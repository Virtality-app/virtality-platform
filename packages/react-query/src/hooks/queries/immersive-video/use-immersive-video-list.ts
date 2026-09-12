import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { ImmersiveVideoConsoleListItem } from '@virtality/orpc/client'
import { useORPC } from '../../../orpc-context.js'

export function useImmersiveVideoList(): UseQueryResult<{
  videos: ImmersiveVideoConsoleListItem[]
}> {
  const orpc = useORPC()
  return useQuery({
    ...orpc.immersiveVideo.list.queryOptions(),
    refetchOnWindowFocus: true,
  })
}
