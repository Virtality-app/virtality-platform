import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.js'

export function useResetTranslation() {
  const orpc = useORPC()
  const queryClient = useQueryClient()

  return useMutation(
    orpc.translation.reset.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.translation.list.key(),
        })
      },
    }),
  )
}
