import { useQuery } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.js'

export function useTranslations() {
  const orpc = useORPC()
  return useQuery(orpc.translation.list.queryOptions({ input: {} }))
}
