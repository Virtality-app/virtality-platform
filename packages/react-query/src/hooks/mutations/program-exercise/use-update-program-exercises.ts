import { useMutation } from '@tanstack/react-query'
import type { ORPCUtils } from '../../../orpc.js'
import { useORPC } from '../../../orpc-context.js'

type UpdateProgramExercisesOnSuccess = ReturnType<
  ORPCUtils['programExercise']['updateMany']['mutationOptions']
>['onSuccess']

interface UseUpdateProgramExercisesProps {
  onSuccess?: UpdateProgramExercisesOnSuccess
}

export function useUpdateProgramExercises({
  onSuccess,
}: UseUpdateProgramExercisesProps = {}) {
  const orpc = useORPC()
  return useMutation(
    orpc.programExercise.updateMany.mutationOptions({ onSuccess }),
  )
}
