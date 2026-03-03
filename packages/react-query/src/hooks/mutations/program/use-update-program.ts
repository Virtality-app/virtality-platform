import { useMutation } from '@tanstack/react-query'
import type { ORPCUtils } from '../../../orpc.js'
import { useORPC } from '../../../orpc-context.js'

type UpdatePatientProgramOnSuccess = ReturnType<
  ORPCUtils['program']['update']['mutationOptions']
>['onSuccess']

interface UseUpdateProgramProps {
  onSuccess?: UpdatePatientProgramOnSuccess
}

export function useUpdateProgram({ onSuccess }: UseUpdateProgramProps = {}) {
  const orpc = useORPC()
  return useMutation(orpc.program.update.mutationOptions({ onSuccess }))
}
