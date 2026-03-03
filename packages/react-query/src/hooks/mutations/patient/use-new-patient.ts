import { useMutation } from '@tanstack/react-query'
import type { ORPCUtils } from '../../../orpc.js'
import { useORPC } from '../../../orpc-context.js'

type CreatePatientMutationOptions = ReturnType<
  ORPCUtils['patient']['create']['mutationOptions']
>
type NewPatientOnSuccess = NonNullable<CreatePatientMutationOptions['onSuccess']>

interface UseNewPatientProps {
  onSuccess?: NewPatientOnSuccess
}

export function useNewPatient({ onSuccess }: UseNewPatientProps = {}) {
  const orpc = useORPC()
  return useMutation(orpc.patient.create.mutationOptions({ onSuccess }))
}
