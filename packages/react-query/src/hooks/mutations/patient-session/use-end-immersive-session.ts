import { useMutation } from '@tanstack/react-query'
import type { ORPCUtils } from '../../../orpc.js'
import { useORPC } from '../../../orpc-context.js'

type EndImmersiveSessionOnSuccess = ReturnType<
  ORPCUtils['patientSession']['endImmersive']['mutationOptions']
>['onSuccess']

interface UseEndImmersiveSessionProps {
  onSuccess?: EndImmersiveSessionOnSuccess
}

export function useEndImmersiveSession({
  onSuccess,
}: UseEndImmersiveSessionProps = {}) {
  const orpc = useORPC()
  return useMutation(
    orpc.patientSession.endImmersive.mutationOptions({ onSuccess }),
  )
}
