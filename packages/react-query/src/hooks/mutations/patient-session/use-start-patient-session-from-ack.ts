import { useMutation } from '@tanstack/react-query'
import type { ORPCUtils } from '../../../orpc.js'
import { useORPC } from '../../../orpc-context.js'

type StartPatientSessionFromAckOnSuccess = ReturnType<
  ORPCUtils['patientSession']['startFromAck']['mutationOptions']
>['onSuccess']

interface UseStartPatientSessionFromAckProps {
  onSuccess?: StartPatientSessionFromAckOnSuccess
}

export function useStartPatientSessionFromAck({
  onSuccess,
}: UseStartPatientSessionFromAckProps = {}) {
  const orpc = useORPC()
  return useMutation(
    orpc.patientSession.startFromAck.mutationOptions({ onSuccess }),
  )
}
