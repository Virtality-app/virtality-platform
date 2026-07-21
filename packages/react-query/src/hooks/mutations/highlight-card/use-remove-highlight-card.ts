import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { HighlightCardCollection } from '@virtality/shared/types'
import { useORPC } from '../../../orpc-context.js'
import { invalidateHighlightCardList } from './invalidate-highlight-card-list.js'

export function useRemoveHighlightCard(collection: HighlightCardCollection) {
  const orpc = useORPC()
  const queryClient = useQueryClient()

  return useMutation(
    orpc.highlightCard.remove.mutationOptions({
      onSuccess: () => {
        invalidateHighlightCardList(queryClient, orpc, collection)
      },
    }),
  )
}
