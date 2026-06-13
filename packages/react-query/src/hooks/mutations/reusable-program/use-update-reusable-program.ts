import { useMutation } from '@tanstack/react-query'
import type { ORPCUtils } from '../../../orpc.js'
import { useORPC } from '../../../orpc-context.js'

type UpdateReusableProgramOnSuccess = ReturnType<
  ORPCUtils['reusableProgram']['update']['mutationOptions']
>['onSuccess']

interface UseUpdateReusableProgramProps {
  onSuccess?: UpdateReusableProgramOnSuccess
}

export function useUpdateReusableProgram({
  onSuccess,
}: UseUpdateReusableProgramProps = {}) {
  const orpc = useORPC()
  return useMutation(orpc.reusableProgram.update.mutationOptions({ onSuccess }))
}
