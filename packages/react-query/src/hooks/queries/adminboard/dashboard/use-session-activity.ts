import { skipToken, useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { SessionActivityReport } from '@virtality/orpc/client'
import { useORPC } from '../../../../orpc-context.js'

export type SessionActivityInput =
  | {
      from: Date | string
      to: Date | string
      /** Start at the first session on record; `from` is ignored. */
      allTime?: boolean
      granularity: 'day' | 'week'
    }
  | undefined

export function useSessionActivity(
  input: SessionActivityInput,
): UseQueryResult<SessionActivityReport, Error> {
  const orpc = useORPC()

  return useQuery(
    orpc.dashboard.getSessionActivity.queryOptions({
      input: input ?? skipToken,
    }),
  )
}
