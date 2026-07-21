import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.js'

export function useReorderHighlightCard() {
  const orpc = useORPC()
  const queryClient = useQueryClient()

  return useMutation(
    orpc.highlightCard.reorder.mutationOptions({
      onSuccess: (data) => {
        const collection = data[0]?.collection

        if (!collection) {
          return
        }

        queryClient.invalidateQueries({
          queryKey: orpc.highlightCard.list.key({
            input: { collection },
          }),
        })
      },
    }),
  )
}
