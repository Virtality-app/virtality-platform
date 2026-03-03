import { useMutation } from '@tanstack/react-query'
import type { ORPCUtils } from '../../../orpc.js'
import { useORPC } from '../../../orpc-context.js'

type CreatePatientSessionOnSuccess = ReturnType<
  ORPCUtils['patientSession']['create']['mutationOptions']
>['onSuccess']

interface UseCreatePatientSessionProps {
  onSuccess?: CreatePatientSessionOnSuccess
}

export function useCreatePatientSession({
  onSuccess,
}: UseCreatePatientSessionProps = {}) {
  const orpc = useORPC()
  return useMutation(
    orpc.patientSession.create.mutationOptions({ onSuccess }),
  )
}
