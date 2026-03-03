import { useMutation } from '@tanstack/react-query'
import type { ORPCUtils } from '../../../orpc.js'
import { useORPC } from '../../../orpc-context.js'

type UpdatePatientSessionOnSuccess = ReturnType<
  ORPCUtils['patientSession']['update']['mutationOptions']
>['onSuccess']

interface UseUpdatePatientSessionProps {
  onSuccess?: UpdatePatientSessionOnSuccess
}

export function useUpdatePatientSession({
  onSuccess,
}: UseUpdatePatientSessionProps = {}) {
  const orpc = useORPC()
  return useMutation(
    orpc.patientSession.update.mutationOptions({ onSuccess }),
  )
}
