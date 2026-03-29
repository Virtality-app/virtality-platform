import { useMutation } from '@tanstack/react-query'
import type { ORPCUtils } from '../../../orpc.js'
import { useORPC } from '../../../orpc-context.js'

type AddFavoriteExerciseOnSuccess = ReturnType<
  ORPCUtils['favoriteExercise']['add']['mutationOptions']
>['onSuccess']

interface UseAddFavoriteExerciseProps {
  onSuccess?: AddFavoriteExerciseOnSuccess
}

export function useAddFavoriteExercise({
  onSuccess,
}: UseAddFavoriteExerciseProps = {}) {
  const orpc = useORPC()
  return useMutation(orpc.favoriteExercise.add.mutationOptions({ onSuccess }))
}
