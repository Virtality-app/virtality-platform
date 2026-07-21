import { useQuery } from '@tanstack/react-query'
import type { HighlightCardCollection } from '@virtality/shared/types'
import { useORPC } from '../../../orpc-context.js'

export function useHighlightCards(collection: HighlightCardCollection) {
  const orpc = useORPC()
  return useQuery(
    orpc.highlightCard.list.queryOptions({ input: { collection } }),
  )
}
