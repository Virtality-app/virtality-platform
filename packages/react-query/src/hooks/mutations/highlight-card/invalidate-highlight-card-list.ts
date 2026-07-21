import type { QueryClient } from '@tanstack/react-query'
import type { HighlightCardCollection } from '@virtality/shared/types'
import type { ORPCUtils } from '../../../orpc.js'

export function invalidateHighlightCardList(
  queryClient: QueryClient,
  orpc: ORPCUtils,
  collection: HighlightCardCollection,
) {
  return queryClient.invalidateQueries({
    queryKey: orpc.highlightCard.list.key({ input: { collection } }),
  })
}
