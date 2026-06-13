import { useMutation } from '@tanstack/react-query'
import type { ORPCUtils } from '../../../orpc.js'
import { useORPC } from '../../../orpc-context.js'

type RetireReusableProgramOnSuccess = ReturnType<
  ORPCUtils['reusableProgram']['retire']['mutationOptions']
>['onSuccess']

interface UseRetireReusableProgramProps {
  onSuccess?: RetireReusableProgramOnSuccess
}

export function useRetireReusableProgram({
  onSuccess,
}: UseRetireReusableProgramProps = {}) {
  const orpc = useORPC()
  return useMutation(orpc.reusableProgram.retire.mutationOptions({ onSuccess }))
}
