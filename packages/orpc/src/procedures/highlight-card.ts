import { ORPCError } from '@orpc/server'
import type { PrismaClient } from '@virtality/db'
import * as lucideReact from 'lucide-react'
import {
  createHighlightCardInputSchema,
  listHighlightCardsInputSchema,
  removeHighlightCardInputSchema,
  reorderHighlightCardInputSchema,
  updateHighlightCardInputSchema,
} from '@virtality/shared/types'
import { generateUUID } from '@virtality/shared/utils'
import {
  createHighlightCard,
  HighlightCardCollectionFullError,
  HighlightCardNotFoundError,
  HighlightCardValidationError,
  listHighlightCards,
  removeHighlightCard,
  reorderHighlightCard,
  updateHighlightCard,
  type HighlightCardStore,
} from '@virtality/shared/utils'
import { authed } from '../middleware/auth.ts'
import { base } from '../context.ts'

const highlightCardLucideModule = lucideReact

function createPrismaHighlightCardStore(
  prisma: PrismaClient,
): HighlightCardStore {
  return {
    findById: (id) =>
      prisma.marketingHighlightCard.findUnique({
        where: { id },
      }),
    findMaxSortOrder: async (collection) => {
      const aggregate = await prisma.marketingHighlightCard.aggregate({
        where: { collection },
        _max: { sortOrder: true },
      })

      return aggregate._max.sortOrder
    },
    create: (data) => prisma.marketingHighlightCard.create({ data }),
    update: (id, data) =>
      prisma.marketingHighlightCard.update({
        where: { id },
        data,
      }),
    deleteById: async (id) => {
      await prisma.marketingHighlightCard.delete({
        where: { id },
      })
    },
    listAll: () => prisma.marketingHighlightCard.findMany(),
    listByCollection: (collection) =>
      prisma.marketingHighlightCard.findMany({
        where: { collection },
      }),
  }
}

export function toHighlightCardOrpcError(
  error: unknown,
): ORPCError<string, unknown> | null {
  if (error instanceof HighlightCardValidationError) {
    return new ORPCError('BAD_REQUEST', { message: error.message })
  }

  if (error instanceof HighlightCardCollectionFullError) {
    return new ORPCError('CONFLICT', { message: error.message })
  }

  if (error instanceof HighlightCardNotFoundError) {
    return new ORPCError('NOT_FOUND', { message: error.message })
  }

  return null
}

function throwHighlightCardOrpcError(error: unknown): never {
  const orpcError = toHighlightCardOrpcError(error)
  if (orpcError) {
    throw orpcError
  }

  throw error
}

async function withHighlightCardStore<T>(
  prisma: PrismaClient,
  operation: (store: HighlightCardStore) => Promise<T>,
): Promise<T> {
  try {
    return await operation(createPrismaHighlightCardStore(prisma))
  } catch (error) {
    throwHighlightCardOrpcError(error)
  }
}

const listHighlightCardsProcedure = base
  .route({ path: '/highlight-card/list', method: 'GET' })
  .input(listHighlightCardsInputSchema)
  .handler(async ({ context, input }) => {
    const { prisma } = context
    return listHighlightCards(
      createPrismaHighlightCardStore(prisma),
      input.collection,
    )
  })

const createHighlightCardProcedure = authed
  .route({ path: '/highlight-card/create', method: 'POST' })
  .input(createHighlightCardInputSchema)
  .handler(({ context, input }) =>
    withHighlightCardStore(context.prisma, (store) =>
      createHighlightCard(
        store,
        {
          generateId: generateUUID,
          lucideModule: highlightCardLucideModule,
        },
        input,
      ),
    ),
  )

const updateHighlightCardProcedure = authed
  .route({ path: '/highlight-card/update', method: 'POST' })
  .input(updateHighlightCardInputSchema)
  .handler(({ context, input }) =>
    withHighlightCardStore(context.prisma, (store) =>
      updateHighlightCard(
        store,
        { lucideModule: highlightCardLucideModule },
        input,
      ),
    ),
  )

const reorderHighlightCardProcedure = authed
  .route({ path: '/highlight-card/reorder', method: 'POST' })
  .input(reorderHighlightCardInputSchema)
  .handler(({ context, input }) =>
    withHighlightCardStore(context.prisma, (store) =>
      reorderHighlightCard(store, input),
    ),
  )

const removeHighlightCardProcedure = authed
  .route({ path: '/highlight-card/remove', method: 'DELETE' })
  .input(removeHighlightCardInputSchema)
  .handler(({ context, input }) =>
    withHighlightCardStore(context.prisma, (store) =>
      removeHighlightCard(store, input),
    ),
  )

export const highlightCard = {
  list: listHighlightCardsProcedure,
  create: createHighlightCardProcedure,
  update: updateHighlightCardProcedure,
  reorder: reorderHighlightCardProcedure,
  remove: removeHighlightCardProcedure,
}
