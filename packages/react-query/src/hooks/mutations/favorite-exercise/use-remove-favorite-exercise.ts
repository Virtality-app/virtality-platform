import { useMutation } from '@tanstack/react-query'
import type { ORPCUtils } from '../../../orpc.js'
import { useORPC } from '../../../orpc-context.js'

type RemoveFavoriteExerciseOnSuccess = ReturnType<
  ORPCUtils['favoriteExercise']['remove']['mutationOptions']
>['onSuccess']

interface UseRemoveFavoriteExerciseProps {
  onSuccess?: RemoveFavoriteExerciseOnSuccess
}

export function useRemoveFavoriteExercise({
  onSuccess,
}: UseRemoveFavoriteExerciseProps = {}) {
  const orpc = useORPC()
  return useMutation(
    orpc.favoriteExercise.remove.mutationOptions({ onSuccess }),
  )
}
