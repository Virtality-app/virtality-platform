import { useMutation } from '@tanstack/react-query'
import type { ORPCUtils } from '../../../orpc.js'
import { useORPC } from '../../../orpc-context.js'

type CreatePatientSessionDataOnSuccess = ReturnType<
  ORPCUtils['patientSessionData']['create']['mutationOptions']
>['onSuccess']

interface UseCreatePatientSessionDataProps {
  onSuccess?: CreatePatientSessionDataOnSuccess
}

export function useCreatePatientSessionData({
  onSuccess,
}: UseCreatePatientSessionDataProps = {}) {
  const orpc = useORPC()
  return useMutation(
    orpc.patientSessionData.create.mutationOptions({ onSuccess }),
  )
}
