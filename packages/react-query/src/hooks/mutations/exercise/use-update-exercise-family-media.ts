import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.js'

export function useUpdateExerciseFamilyMedia() {
  const orpc = useORPC()
  const queryClient = useQueryClient()

  return useMutation(
    orpc.exercise.updateFamilyMedia.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.exercise.list.key(),
        })
      },
    }),
  )
}
