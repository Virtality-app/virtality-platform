import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.js'
import { invalidateHighlightCardList } from './invalidate-highlight-card-list.js'

export function useReorderHighlightCard() {
  const orpc = useORPC()
  const queryClient = useQueryClient()

  return useMutation(
    orpc.highlightCard.reorder.mutationOptions({
      onSuccess: (data) => {
        const collection = data.at(0)?.collection
        if (collection) {
          invalidateHighlightCardList(queryClient, orpc, collection)
        }
      },
    }),
  )
}
