import { useMutation } from '@tanstack/react-query'
import type { ORPCUtils } from '../../../orpc.js'
import { useORPC } from '../../../orpc-context.js'

type CopyReusableProgramOnSuccess = ReturnType<
  ORPCUtils['reusableProgram']['copy']['mutationOptions']
>['onSuccess']

interface UseCopyReusableProgramProps {
  onSuccess?: CopyReusableProgramOnSuccess
}

export function useCopyReusableProgram({
  onSuccess,
}: UseCopyReusableProgramProps = {}) {
  const orpc = useORPC()
  return useMutation(orpc.reusableProgram.copy.mutationOptions({ onSuccess }))
}
