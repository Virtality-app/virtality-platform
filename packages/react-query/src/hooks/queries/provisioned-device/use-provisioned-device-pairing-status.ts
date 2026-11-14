import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { DevicePairingState } from '@virtality/orpc/client'
import { useORPC } from '../../../orpc-context.js'

export type ProvisionedDevicePairingStatus = {
  attemptId: string
  state: DevicePairingState
  expiresAt: Date
  serverTime: Date
}

/** Polls a staff Pairing Claim every 2 s while it is pending. */
export function useProvisionedDevicePairingStatus(
  attemptId: string | null,
): UseQueryResult<ProvisionedDevicePairingStatus> {
  const orpc = useORPC()
  return useQuery({
    ...orpc.provisionedDevice.pairing.status.queryOptions({
      input: { attemptId: attemptId ?? '' },
    }),
    enabled: Boolean(attemptId),
    refetchInterval: (query) =>
      !query.state.data || query.state.data.state === 'pending' ? 2000 : false,
    refetchOnWindowFocus: true,
  })
}
