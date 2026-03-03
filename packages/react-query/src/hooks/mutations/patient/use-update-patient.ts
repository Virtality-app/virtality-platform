import { useMutation } from '@tanstack/react-query'
import type { ORPCUtils } from '../../../orpc.js'
import { useORPC } from '../../../orpc-context.js'

type UpdatePatientOnSuccess = ReturnType<
  ORPCUtils['patient']['update']['mutationOptions']
>['onSuccess']

interface UseUpdatePatientProps {
  onSuccess?: UpdatePatientOnSuccess
}

export function useUpdatePatient({ onSuccess }: UseUpdatePatientProps = {}) {
  const orpc = useORPC()
  return useMutation(orpc.patient.update.mutationOptions({ onSuccess }))
}
