'use client'

import {
  QueryClient,
  QueryClientProvider,
  defaultShouldDehydrateQuery,
  isServer,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import React, { type ReactNode } from 'react'
import superjson from 'superjson'

const staleTime = 60 * 1000

/**
 * Create a QueryClient with Virtality defaults (staleTime, superjson serialization, SSR-friendly dehydrate/hydrate).
 */
function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime,
      },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
        shouldRedactErrors: () => false,
      },
      hydrate: { deserializeData: superjson.deserialize },
    },
  })
}

let browserQueryClient: QueryClient | undefined

/**
 * Returns a QueryClient (per-request on server, singleton in browser).
 * Use this when you need the client outside of React (e.g. prefetch, invalidation in non-hook code).
 */
export function getQueryClient(): QueryClient {
  if (isServer) {
    return makeQueryClient()
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }
  return browserQueryClient
}

export interface QueryProviderProps {
  children?: ReactNode
  devtools?: boolean
}

/**
 * Provider that wraps the app with QueryClientProvider and optionally ReactQueryDevtools.
 * Uses getQueryClient() when client is not passed.
 */
export function QueryProvider({
  children,
  devtools = process.env.NODE_ENV === 'development',
}: QueryProviderProps): React.ReactElement {
  const queryClient = getQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {devtools && <ReactQueryDevtools />}
    </QueryClientProvider>
  )
}
