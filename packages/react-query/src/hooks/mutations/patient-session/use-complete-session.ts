import { useMutation } from '@tanstack/react-query'
import type { ORPCUtils } from '../../../orpc.js'
import { useORPC } from '../../../orpc-context.js'

type CompleteSessionOnSuccess = ReturnType<
  ORPCUtils['patientSession']['complete']['mutationOptions']
>['onSuccess']

interface UseCompleteSessionProps {
  onSuccess?: CompleteSessionOnSuccess
}

export function useCompleteSession({
  onSuccess,
}: UseCompleteSessionProps = {}) {
  const orpc = useORPC()
  return useMutation(
    orpc.patientSession.complete.mutationOptions({ onSuccess }),
  )
}
