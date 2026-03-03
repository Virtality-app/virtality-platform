import { useMutation } from '@tanstack/react-query'
import type { ORPCUtils } from '../../../orpc.js'
import { useORPC } from '../../../orpc-context.js'

type SetDeviceIdOnSuccess = ReturnType<
  ORPCUtils['device']['setDeviceId']['mutationOptions']
>['onSuccess']

interface UseSetDeviceIdProps {
  onSuccess?: SetDeviceIdOnSuccess
}

export function useSetDeviceId({ onSuccess }: UseSetDeviceIdProps = {}) {
  const orpc = useORPC()
  return useMutation(orpc.device.setDeviceId.mutationOptions({ onSuccess }))
}
