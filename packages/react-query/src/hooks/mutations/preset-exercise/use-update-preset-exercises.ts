import { useMutation } from '@tanstack/react-query'
import type { ORPCUtils } from '../../../orpc.js'
import { useORPC } from '../../../orpc-context.js'

type UpdatePresetExercisesOnSuccess = ReturnType<
  ORPCUtils['presetExercise']['updateMany']['mutationOptions']
>['onSuccess']

interface UseUpdatePresetExercisesProps {
  onSuccess?: UpdatePresetExercisesOnSuccess
}

export function useUpdatePresetExercises({
  onSuccess,
}: UseUpdatePresetExercisesProps = {}) {
  const orpc = useORPC()
  return useMutation(
    orpc.presetExercise.updateMany.mutationOptions({ onSuccess }),
  )
}
