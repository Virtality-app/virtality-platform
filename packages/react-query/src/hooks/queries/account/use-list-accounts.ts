import { useQuery } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.tsx'
import { ORPCUtils } from '../../../orpc.ts'

type UseListAccountsProps = ReturnType<
  ORPCUtils['account']['list']['queryOptions']
>

export function useListAccounts(props?: UseListAccountsProps) {
  const orpc = useORPC()
  return useQuery(orpc.account.list.queryOptions(props ? { ...props } : {}))
}
