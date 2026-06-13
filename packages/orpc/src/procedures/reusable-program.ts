import { ORPCError } from '@orpc/server'
import { ReusableProgramSchema } from '@virtality/db/definitions'
import {
  assertClinicianCanMutateProgram,
  buildClinicianOwnedProgramListWhere,
  buildRetireProgramData,
  buildStarterTemplateListWhere,
  generateUUID,
} from '@virtality/shared/utils'
import { authed } from '../middleware/auth.ts'

const programInclude = {
  exercises: {
    orderBy: { position: 'asc' as const },
  },
} as const

const listReusablePrograms = authed
  .route({ path: '/reusable-program/list', method: 'GET' })
  .handler(async ({ context }) => {
    const { prisma, user } = context

    return prisma.reusableProgram.findMany({
      where: buildClinicianOwnedProgramListWhere(user.id),
      include: programInclude,
      orderBy: { updatedAt: 'desc' },
    })
  })

const listStarterTemplates = authed
  .route({ path: '/reusable-program/list-starter-templates', method: 'GET' })
  .handler(async ({ context }) => {
    const { prisma } = context

    return prisma.reusableProgram.findMany({
      where: buildStarterTemplateListWhere(),
      include: programInclude,
      orderBy: { name: 'asc' },
    })
  })

const findReusableProgram = authed
  .route({ path: '/reusable-program/find', method: 'GET' })
  .input(ReusableProgramSchema.pick({ id: true }))
  .handler(async ({ context, input }) => {
    const { prisma, user } = context

    const program = await prisma.reusableProgram.findFirst({
      where: {
        id: input.id,
        OR: [
          {
            userId: user.id,
            kind: 'CLINICIAN_OWNED',
          },
          {
            kind: 'STARTER_TEMPLATE',
            userId: null,
          },
        ],
      },
      include: programInclude,
    })

    if (!program) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Reusable program not found',
      })
    }

    return program
  })

const createReusableProgram = authed
  .route({ path: '/reusable-program/create', method: 'POST' })
  .input(ReusableProgramSchema.pick({ name: true }))
  .handler(async ({ context, input }) => {
    const { prisma, user } = context
    const now = new Date()

    return prisma.reusableProgram.create({
      data: {
        id: generateUUID(),
        name: input.name.trim() === '' ? 'untitled' : input.name.trim(),
        kind: 'CLINICIAN_OWNED',
        userId: user.id,
        createdAt: now,
        updatedAt: now,
        retiredAt: null,
      },
      include: programInclude,
    })
  })

const updateReusableProgram = authed
  .route({ path: '/reusable-program/update', method: 'PUT' })
  .input(ReusableProgramSchema.pick({ id: true, name: true }))
  .handler(async ({ context, input }) => {
    const { prisma, user } = context

    const existing = await prisma.reusableProgram.findFirst({
      where: { id: input.id },
    })

    try {
      assertClinicianCanMutateProgram(existing, user.id)
    } catch (error) {
      throw new ORPCError('FORBIDDEN', {
        message: error instanceof Error ? error.message : 'Forbidden',
      })
    }

    return prisma.reusableProgram.update({
      where: { id: input.id },
      data: {
        name: input.name.trim() === '' ? 'untitled' : input.name.trim(),
        updatedAt: new Date(),
      },
      include: programInclude,
    })
  })

const retireReusableProgram = authed
  .route({ path: '/reusable-program/retire', method: 'POST' })
  .input(ReusableProgramSchema.pick({ id: true }))
  .handler(async ({ context, input }) => {
    const { prisma, user } = context

    const existing = await prisma.reusableProgram.findFirst({
      where: { id: input.id },
    })

    try {
      assertClinicianCanMutateProgram(existing, user.id)
    } catch (error) {
      throw new ORPCError('FORBIDDEN', {
        message: error instanceof Error ? error.message : 'Forbidden',
      })
    }

    return prisma.reusableProgram.update({
      where: { id: input.id },
      data: buildRetireProgramData(),
      include: programInclude,
    })
  })

export const reusableProgram = {
  list: listReusablePrograms,
  listStarterTemplates,
  find: findReusableProgram,
  create: createReusableProgram,
  update: updateReusableProgram,
  retire: retireReusableProgram,
}
