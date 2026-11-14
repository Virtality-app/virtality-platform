import { useMutation } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.js'
import { useInvalidateProvisionedDevices } from './use-invalidate-provisioned-devices.js'

export function useStartProvisionedDevicePairing() {
  const orpc = useORPC()
  const invalidate = useInvalidateProvisionedDevices()
  return useMutation(
    orpc.provisionedDevice.pairing.start.mutationOptions({
      onSuccess: invalidate,
    }),
  )
}
