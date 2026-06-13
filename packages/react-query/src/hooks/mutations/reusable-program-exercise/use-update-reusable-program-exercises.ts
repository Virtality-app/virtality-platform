import { useMutation } from '@tanstack/react-query'
import type { ORPCUtils } from '../../../orpc.js'
import { useORPC } from '../../../orpc-context.js'

type UpdateReusableProgramExercisesOnSuccess = ReturnType<
  ORPCUtils['reusableProgramExercise']['updateMany']['mutationOptions']
>['onSuccess']

interface UseUpdateReusableProgramExercisesProps {
  onSuccess?: UpdateReusableProgramExercisesOnSuccess
}

export function useUpdateReusableProgramExercises({
  onSuccess,
}: UseUpdateReusableProgramExercisesProps = {}) {
  const orpc = useORPC()
  return useMutation(
    orpc.reusableProgramExercise.updateMany.mutationOptions({ onSuccess }),
  )
}
