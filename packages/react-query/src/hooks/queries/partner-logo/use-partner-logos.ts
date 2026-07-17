import { useQuery } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.js'

export function usePartnerLogos() {
  const orpc = useORPC()
  return useQuery(orpc.partnerLogo.list.queryOptions())
}
