import { useMutation } from '@tanstack/react-query'
import type { ORPCUtils } from '../../../orpc.js'
import { useORPC } from '../../../orpc-context.js'

type PresetExerciseOnSuccess = ReturnType<
  ORPCUtils['presetExercise']['createMany']['mutationOptions']
>['onSuccess']

interface UseCreatePresetExercisesProps {
  onSuccess?: PresetExerciseOnSuccess
}

export function useCreatePresetExercises({
  onSuccess,
}: UseCreatePresetExercisesProps = {}) {
  const orpc = useORPC()
  return useMutation(
    orpc.presetExercise.createMany.mutationOptions({ onSuccess }),
  )
}
