import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.js'

export function useUpdateHighlightCard() {
  const orpc = useORPC()
  const queryClient = useQueryClient()

  return useMutation(
    orpc.highlightCard.update.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: orpc.highlightCard.list.key({
            input: { collection: data.collection },
          }),
        })
      },
    }),
  )
}
