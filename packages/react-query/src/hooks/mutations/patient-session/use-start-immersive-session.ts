import { useMutation } from '@tanstack/react-query'
import type { ORPCUtils } from '../../../orpc.js'
import { useORPC } from '../../../orpc-context.js'

type StartImmersiveSessionOnSuccess = ReturnType<
  ORPCUtils['patientSession']['startImmersive']['mutationOptions']
>['onSuccess']

interface UseStartImmersiveSessionProps {
  onSuccess?: StartImmersiveSessionOnSuccess
}

export function useStartImmersiveSession({
  onSuccess,
}: UseStartImmersiveSessionProps = {}) {
  const orpc = useORPC()
  return useMutation(
    orpc.patientSession.startImmersive.mutationOptions({ onSuccess }),
  )
}
