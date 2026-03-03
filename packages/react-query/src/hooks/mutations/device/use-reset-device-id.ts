import { useMutation } from '@tanstack/react-query'
import type { ORPCUtils } from '../../../orpc.js'
import { useORPC } from '../../../orpc-context.js'

type ResetDeviceIdOnSuccess = ReturnType<
  ORPCUtils['device']['resetDeviceId']['mutationOptions']
>['onSuccess']

interface UseResetDeviceIdProps {
  onSuccess?: ResetDeviceIdOnSuccess
}

export function useResetDeviceId({ onSuccess }: UseResetDeviceIdProps = {}) {
  const orpc = useORPC()
  return useMutation(orpc.device.resetDeviceId.mutationOptions({ onSuccess }))
}
