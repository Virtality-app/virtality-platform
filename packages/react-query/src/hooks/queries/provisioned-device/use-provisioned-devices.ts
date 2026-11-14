import { useQuery } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.js'

/** Adminboard: Devices with no owner, plus Devices a code has delivered. */
export function useProvisionedDevices() {
  const orpc = useORPC()
  return useQuery(orpc.provisionedDevice.list.queryOptions())
}
