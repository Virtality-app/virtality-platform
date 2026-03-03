import { useMutation } from '@tanstack/react-query'
import type { ORPCUtils } from '../../../orpc.js'
import { useORPC } from '../../../orpc-context.js'

type DeletePatientOnSuccess = ReturnType<
  ORPCUtils['patient']['delete']['mutationOptions']
>['onSuccess']

interface UseDeletePatientProps {
  onSuccess?: DeletePatientOnSuccess
}

export function useDeletePatient({ onSuccess }: UseDeletePatientProps = {}) {
  const orpc = useORPC()
  return useMutation(orpc.patient.delete.mutationOptions({ onSuccess }))
}
