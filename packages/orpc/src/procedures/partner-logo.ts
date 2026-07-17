import { ORPCError } from '@orpc/server'
import type { PrismaClient } from '@virtality/db'
import {
  createPartnerLogoInputSchema,
  removePartnerLogoInputSchema,
  reorderPartnerLogoInputSchema,
  updatePartnerLogoInputSchema,
} from '@virtality/shared/types'
import { generateUUID } from '@virtality/shared/utils'
import {
  createPartnerLogo,
  deleteBucketObject,
  listPartnerLogos,
  PartnerLogoNotFoundError,
  PartnerLogoObjectKeyAlreadyAssignedError,
  PartnerLogoValidationError,
  removePartnerLogo,
  reorderPartnerLogo,
  updatePartnerLogo,
  type PartnerLogoStore,
} from '@virtality/shared/utils'
import { authed } from '../middleware/auth.ts'
import { base } from '../context.ts'

function createPrismaPartnerLogoStore(prisma: PrismaClient): PartnerLogoStore {
  return {
    findById: (id) =>
      prisma.marketingPartnerLogo.findUnique({
        where: { id },
      }),
    findByObjectKey: (objectKey) =>
      prisma.marketingPartnerLogo.findUnique({
        where: { objectKey },
      }),
    findMaxSortOrder: async (category) => {
      const aggregate = await prisma.marketingPartnerLogo.aggregate({
        where: { category },
        _max: { sortOrder: true },
      })

      return aggregate._max.sortOrder
    },
    create: (data) => prisma.marketingPartnerLogo.create({ data }),
    update: (id, data) =>
      prisma.marketingPartnerLogo.update({
        where: { id },
        data,
      }),
    deleteById: async (id) => {
      await prisma.marketingPartnerLogo.delete({
        where: { id },
      })
    },
    listAll: () => prisma.marketingPartnerLogo.findMany(),
  }
}

function throwPartnerLogoOrpcError(error: unknown): never {
  if (error instanceof PartnerLogoValidationError) {
    throw new ORPCError('BAD_REQUEST', { message: error.message })
  }

  if (error instanceof PartnerLogoObjectKeyAlreadyAssignedError) {
    throw new ORPCError('CONFLICT', { message: error.message })
  }

  if (error instanceof PartnerLogoNotFoundError) {
    throw new ORPCError('NOT_FOUND', { message: error.message })
  }

  throw error
}

async function withPartnerLogoStore<T>(
  prisma: PrismaClient,
  operation: (store: PartnerLogoStore) => Promise<T>,
): Promise<T> {
  try {
    return await operation(createPrismaPartnerLogoStore(prisma))
  } catch (error) {
    throwPartnerLogoOrpcError(error)
  }
}

const listPartnerLogosProcedure = base
  .route({ path: '/partner-logo/list', method: 'GET' })
  .handler(async ({ context }) => {
    const { prisma } = context
    return listPartnerLogos(createPrismaPartnerLogoStore(prisma))
  })

const createPartnerLogoProcedure = authed
  .route({ path: '/partner-logo/create', method: 'POST' })
  .input(createPartnerLogoInputSchema)
  .handler(({ context, input }) =>
    withPartnerLogoStore(context.prisma, (store) =>
      createPartnerLogo(store, { generateId: generateUUID }, input),
    ),
  )

const updatePartnerLogoProcedure = authed
  .route({ path: '/partner-logo/update', method: 'POST' })
  .input(updatePartnerLogoInputSchema)
  .handler(({ context, input }) =>
    withPartnerLogoStore(context.prisma, (store) =>
      updatePartnerLogo(store, input),
    ),
  )

const reorderPartnerLogoProcedure = authed
  .route({ path: '/partner-logo/reorder', method: 'POST' })
  .input(reorderPartnerLogoInputSchema)
  .handler(({ context, input }) =>
    withPartnerLogoStore(context.prisma, (store) =>
      reorderPartnerLogo(store, input),
    ),
  )

const removePartnerLogoProcedure = authed
  .route({ path: '/partner-logo/remove', method: 'DELETE' })
  .input(removePartnerLogoInputSchema)
  .handler(({ context, input }) =>
    withPartnerLogoStore(context.prisma, (store) =>
      removePartnerLogo(
        store,
        {
          deleteBucketObject: {
            deleteObject: async (objectKey) => {
              await deleteBucketObject({
                s3: context.s3,
                objectKey,
              })
            },
          },
        },
        input,
      ),
    ),
  )

export const partnerLogo = {
  list: listPartnerLogosProcedure,
  create: createPartnerLogoProcedure,
  update: updatePartnerLogoProcedure,
  reorder: reorderPartnerLogoProcedure,
  remove: removePartnerLogoProcedure,
}
