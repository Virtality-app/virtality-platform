import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.js'

export function useCreateHighlightCard() {
  const orpc = useORPC()
  const queryClient = useQueryClient()

  return useMutation(
    orpc.highlightCard.create.mutationOptions({
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: orpc.highlightCard.list.key({
            input: { collection: variables.collection },
          }),
        })
      },
    }),
  )
}
