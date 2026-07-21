import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCreateHighlightCard } from './use-create-highlight-card.ts'
import { useRemoveHighlightCard } from './use-remove-highlight-card.ts'
import { useReorderHighlightCard } from './use-reorder-highlight-card.ts'
import { useUpdateHighlightCard } from './use-update-highlight-card.ts'
import { useHighlightCards } from '../../queries/highlight-card/use-highlight-cards.ts'

const highlightCardListItem = {
  id: 'card-1',
  collection: 'benefits' as const,
  title: 'Faster recovery',
  body: 'Patients recover sooner with guided VR therapy.',
  iconName: 'HeartPulse',
  sortOrder: 0,
}

const orpcMock = createTanstackQueryUtils({
  highlightCard: {
    list: vi.fn().mockResolvedValue([highlightCardListItem]),
    create: vi.fn().mockResolvedValue(highlightCardListItem),
    update: vi.fn().mockResolvedValue(highlightCardListItem),
    reorder: vi.fn().mockResolvedValue([highlightCardListItem]),
    remove: vi.fn().mockResolvedValue({ id: highlightCardListItem.id }),
  },
})

vi.mock('../../../orpc-context.js', () => ({
  useORPC: () => orpcMock,
}))

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('highlight card hooks', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  it('useHighlightCards registers a features collection query', () => {
    renderHook(() => useHighlightCards('features'), {
      wrapper: createWrapper(queryClient),
    })

    const featuresQuery = queryClient
      .getQueryCache()
      .getAll()
      .find((query) =>
        JSON.stringify(query.queryKey).includes('"collection":"features"'),
      )

    expect(featuresQuery).toBeDefined()
  })

  it('builds collection-scoped list query options', () => {
    const options = orpcMock.highlightCard.list.queryOptions({
      input: { collection: 'benefits' },
    })

    expect(options.queryKey).toEqual(
      orpcMock.highlightCard.list.queryKey({
        input: { collection: 'benefits' },
      }),
    )
  })

  it('scopes list query keys by collection', () => {
    const benefitsKey = orpcMock.highlightCard.list.key({
      input: { collection: 'benefits' },
    })
    const featuresKey = orpcMock.highlightCard.list.key({
      input: { collection: 'features' },
    })

    expect(benefitsKey).not.toEqual(featuresKey)
  })

  it('invalidates the benefits list after create', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateHighlightCard(), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate({
      collection: 'benefits',
      title: 'Faster recovery',
      body: 'Patients recover sooner with guided VR therapy.',
      iconName: 'HeartPulse',
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: orpcMock.highlightCard.list.key({
        input: { collection: 'benefits' },
      }),
    })
  })

  it('invalidates the card collection after update', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateHighlightCard(), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate({
      id: highlightCardListItem.id,
      title: highlightCardListItem.title,
      body: highlightCardListItem.body,
      iconName: highlightCardListItem.iconName,
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: orpcMock.highlightCard.list.key({
        input: { collection: 'benefits' },
      }),
    })
  })

  it('invalidates the card collection after reorder', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useReorderHighlightCard(), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate({
      id: highlightCardListItem.id,
      direction: 'up',
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: orpcMock.highlightCard.list.key({
        input: { collection: 'benefits' },
      }),
    })
  })

  it('invalidates the scoped collection after remove', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useRemoveHighlightCard('features'), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate({ id: highlightCardListItem.id })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: orpcMock.highlightCard.list.key({
        input: { collection: 'features' },
      }),
    })
  })
})
