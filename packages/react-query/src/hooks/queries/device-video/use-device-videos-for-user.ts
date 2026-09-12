import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { DeviceVideoListForUserResult } from '@virtality/orpc/client'
import { useORPC } from '../../../orpc-context.js'

export function useDeviceVideosForUser(): UseQueryResult<DeviceVideoListForUserResult> {
  const orpc = useORPC()
  return useQuery(orpc.deviceVideo.listForUser.queryOptions())
}
