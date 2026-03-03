import { useMutation } from '@tanstack/react-query'
import type { ORPCUtils } from '../../../orpc.js'
import { useORPC } from '../../../orpc-context.js'

type DeletePatientProgramOnSuccess = ReturnType<
  ORPCUtils['program']['delete']['mutationOptions']
>['onSuccess']

interface UseDeletePatientProgramProps {
  onSuccess?: DeletePatientProgramOnSuccess
}

export function useDeleteProgram({
  onSuccess,
}: UseDeletePatientProgramProps = {}) {
  const orpc = useORPC()
  return useMutation(orpc.program.delete.mutationOptions({ onSuccess }))
}
