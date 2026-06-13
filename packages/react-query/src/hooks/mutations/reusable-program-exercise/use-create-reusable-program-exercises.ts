import { useMutation } from '@tanstack/react-query'
import type { ORPCUtils } from '../../../orpc.js'
import { useORPC } from '../../../orpc-context.js'

type CreateReusableProgramExercisesOnSuccess = ReturnType<
  ORPCUtils['reusableProgramExercise']['createMany']['mutationOptions']
>['onSuccess']

interface UseCreateReusableProgramExercisesProps {
  onSuccess?: CreateReusableProgramExercisesOnSuccess
}

export function useCreateReusableProgramExercises({
  onSuccess,
}: UseCreateReusableProgramExercisesProps = {}) {
  const orpc = useORPC()
  return useMutation(
    orpc.reusableProgramExercise.createMany.mutationOptions({ onSuccess }),
  )
}
