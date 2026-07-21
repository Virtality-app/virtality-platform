import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.js'
import { invalidateHighlightCardList } from './invalidate-highlight-card-list.js'

export function useCreateHighlightCard() {
  const orpc = useORPC()
  const queryClient = useQueryClient()

  return useMutation(
    orpc.highlightCard.create.mutationOptions({
      onSuccess: (_data, variables) => {
        invalidateHighlightCardList(queryClient, orpc, variables.collection)
      },
    }),
  )
}
