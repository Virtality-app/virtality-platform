import { useMutation } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.js'
import { useInvalidateProvisionedDevices } from './use-invalidate-provisioned-devices.js'

export function useUnpairProvisionedDevice() {
  const orpc = useORPC()
  const invalidate = useInvalidateProvisionedDevices()
  return useMutation(
    orpc.provisionedDevice.unpair.mutationOptions({ onSuccess: invalidate }),
  )
}
