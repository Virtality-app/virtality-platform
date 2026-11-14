import { useQueryClient } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.js'

export function useInvalidateProvisionedDevices() {
  const orpc = useORPC()
  const queryClient = useQueryClient()
  return () =>
    queryClient.invalidateQueries({
      queryKey: orpc.provisionedDevice.list.key(),
    })
}
