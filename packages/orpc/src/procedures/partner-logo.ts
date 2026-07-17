import { ORPCError } from '@orpc/server'
import type { PrismaClient } from '@virtality/db'
import { createPartnerLogoInputSchema } from '@virtality/shared/types'
import { generateUUID } from '@virtality/shared/utils'
import {
  createPartnerLogo,
  listPartnerLogos,
  PartnerLogoObjectKeyAlreadyAssignedError,
  PartnerLogoValidationError,
  type PartnerLogoStore,
} from '@virtality/shared/utils'
import { authed } from '../middleware/auth.ts'
import { base } from '../context.ts'

function createPrismaPartnerLogoStore(prisma: PrismaClient): PartnerLogoStore {
  return {
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

  throw error
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
  .handler(async ({ context, input }) => {
    const store = createPrismaPartnerLogoStore(context.prisma)

    try {
      return await createPartnerLogo(store, { generateId: generateUUID }, input)
    } catch (error) {
      throwPartnerLogoOrpcError(error)
    }
  })

export const partnerLogo = {
  list: listPartnerLogosProcedure,
  create: createPartnerLogoProcedure,
}
