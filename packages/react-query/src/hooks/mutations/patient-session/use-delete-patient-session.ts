import { useMutation } from '@tanstack/react-query'
import type { ORPCUtils } from '../../../orpc.js'
import { useORPC } from '../../../orpc-context.js'

type DeletePatientSessionOnSuccess = ReturnType<
  ORPCUtils['patientSession']['delete']['mutationOptions']
>['onSuccess']

interface UseDeletePatientSessionProps {
  onSuccess?: DeletePatientSessionOnSuccess
}

export function useDeletePatientSession({
  onSuccess,
}: UseDeletePatientSessionProps = {}) {
  const orpc = useORPC()
  return useMutation(
    orpc.patientSession.delete.mutationOptions({ onSuccess }),
  )
}
