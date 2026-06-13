import { useMutation } from '@tanstack/react-query'
import type { ORPCUtils } from '../../../orpc.js'
import { useORPC } from '../../../orpc-context.js'

type CreateReusableProgramOnSuccess = ReturnType<
  ORPCUtils['reusableProgram']['create']['mutationOptions']
>['onSuccess']

interface UseCreateReusableProgramProps {
  onSuccess?: CreateReusableProgramOnSuccess
}

export function useCreateReusableProgram({
  onSuccess,
}: UseCreateReusableProgramProps = {}) {
  const orpc = useORPC()
  return useMutation(orpc.reusableProgram.create.mutationOptions({ onSuccess }))
}
