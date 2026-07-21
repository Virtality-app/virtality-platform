import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.js'
import { invalidateHighlightCardList } from './invalidate-highlight-card-list.js'

export function useUpdateHighlightCard() {
  const orpc = useORPC()
  const queryClient = useQueryClient()

  return useMutation(
    orpc.highlightCard.update.mutationOptions({
      onSuccess: (data) => {
        invalidateHighlightCardList(queryClient, orpc, data.collection)
      },
    }),
  )
}
