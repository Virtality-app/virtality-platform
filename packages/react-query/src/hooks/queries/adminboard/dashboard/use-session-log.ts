import {
  keepPreviousData,
  skipToken,
  useQuery,
  type UseQueryResult,
} from '@tanstack/react-query'
import type {
  SessionLog,
  SessionSavedFilter,
  SessionType,
} from '@virtality/orpc/client'
import { useORPC } from '../../../../orpc-context.js'

export type SessionLogInput =
  | {
      from: Date | string
      to: Date | string
      /** Start at the first session on record; `from` is ignored. */
      allTime?: boolean
      type: SessionType | 'all'
      ownerUserId: string
      /** Saved sessions, Don't Save ones, or both. */
      saved: SessionSavedFilter
      search: string
      page: number
      pageSize: number
    }
  | undefined

export function useSessionLog(
  input: SessionLogInput,
): UseQueryResult<SessionLog, Error> {
  const orpc = useORPC()

  return useQuery({
    ...orpc.dashboard.getSessionLog.queryOptions({
      input: input ?? skipToken,
    }),
    placeholderData: keepPreviousData,
  })
}
