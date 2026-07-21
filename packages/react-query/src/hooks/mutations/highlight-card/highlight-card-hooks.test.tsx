import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { HighlightCardCollection } from '@virtality/shared/types'
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

function highlightCardListKey(collection: HighlightCardCollection) {
  return orpcMock.highlightCard.list.key({ input: { collection } })
}

describe('highlight card hooks', () => {
  let queryClient: QueryClient

  function seedHighlightCardList(collection: HighlightCardCollection) {
    queryClient.setQueryData(highlightCardListKey(collection), [
      highlightCardListItem,
    ])
  }

  function expectCollectionListInvalidated(
    collection: HighlightCardCollection,
  ) {
    expect(
      queryClient.getQueryState(highlightCardListKey(collection))
        ?.isInvalidated,
    ).toBe(true)
  }

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
    const featuresQueryKey = orpcMock.highlightCard.list.queryOptions({
      input: { collection: 'features' },
    }).queryKey

    renderHook(() => useHighlightCards('features'), {
      wrapper: createWrapper(queryClient),
    })

    expect(
      queryClient.getQueryCache().find({ queryKey: featuresQueryKey }),
    ).toBeDefined()
  })

  it('invalidates the benefits list after create', async () => {
    seedHighlightCardList('benefits')

    const { result } = renderHook(() => useCreateHighlightCard(), {
      wrapper: createWrapper(queryClient),
    })

    const { collection, title, body, iconName } = highlightCardListItem
    result.current.mutate({ collection, title, body, iconName })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expectCollectionListInvalidated('benefits')
  })

  it('invalidates the card collection after update', async () => {
    seedHighlightCardList('benefits')

    const { result } = renderHook(() => useUpdateHighlightCard(), {
      wrapper: createWrapper(queryClient),
    })

    const { id, title, body, iconName } = highlightCardListItem
    result.current.mutate({ id, title, body, iconName })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expectCollectionListInvalidated('benefits')
  })

  it('invalidates the card collection after reorder', async () => {
    seedHighlightCardList('benefits')

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

    expectCollectionListInvalidated('benefits')
  })

  it('invalidates the scoped collection after remove', async () => {
    seedHighlightCardList('features')

    const { result } = renderHook(() => useRemoveHighlightCard('features'), {
      wrapper: createWrapper(queryClient),
    })

    result.current.mutate({ id: highlightCardListItem.id })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expectCollectionListInvalidated('features')
  })
})
