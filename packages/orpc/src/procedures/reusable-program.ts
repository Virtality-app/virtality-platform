import { ORPCError } from '@orpc/server'
import { ReusableProgramSchema } from '@virtality/db/definitions'
import {
  assertClinicianCanMutateProgram,
  buildClinicianOwnedProgramListWhere,
  buildCopiedProgramExercises,
  buildCopiedProgramName,
  buildRetireProgramData,
  buildStarterTemplateListWhere,
  generateUUID,
} from '@virtality/shared/utils'
import type { ProgramOrigin } from '@virtality/analytics'
import type { InitialContext } from '../context.ts'
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

const requireProgramName = (name: string) => {
  const trimmedName = name.trim()
  if (trimmedName === '') {
    throw new ORPCError('BAD_REQUEST', {
      message: 'Program name is required',
    })
  }
  return trimmedName
}

function captureProgramCreated(
  context: Pick<InitialContext, 'analytics'> & { user: { id: string } },
  programId: string,
  origin: ProgramOrigin,
) {
  context.analytics?.capture({
    distinctId: context.user.id,
    event: 'program_created',
    properties: { program_id: programId, origin },
    setOnce: { first_program_created_at: new Date().toISOString() },
  })
}

const createReusableProgram = authed
  .route({ path: '/reusable-program/create', method: 'POST' })
  .input(ReusableProgramSchema.pick({ name: true }))
  .handler(async ({ context, input }) => {
    const { prisma, user } = context
    const now = new Date()
    const trimmedName = requireProgramName(input.name)

    const program = await prisma.reusableProgram.create({
      data: {
        id: generateUUID(),
        name: trimmedName,
        kind: 'CLINICIAN_OWNED',
        userId: user.id,
        createdAt: now,
        updatedAt: now,
        retiredAt: null,
      },
      include: programInclude,
    })

    captureProgramCreated(context, program.id, 'scratch')
    return program
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

    const program = await prisma.reusableProgram.update({
      where: { id: input.id },
      data: {
        name: requireProgramName(input.name),
        updatedAt: new Date(),
      },
      include: programInclude,
    })

    context.analytics?.capture({
      distinctId: user.id,
      event: 'program_renamed',
      properties: { program_id: program.id },
    })
    return program
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

    const program = await prisma.reusableProgram.update({
      where: { id: input.id },
      data: buildRetireProgramData(),
      include: programInclude,
    })

    context.analytics?.capture({
      distinctId: user.id,
      event: 'program_retired',
      properties: { program_id: program.id },
    })
    return program
  })

const copyReusableProgram = authed
  .route({ path: '/reusable-program/copy', method: 'POST' })
  .input(ReusableProgramSchema.pick({ id: true }))
  .handler(async ({ context, input }) => {
    const { prisma, user } = context

    const source = await prisma.reusableProgram.findFirst({
      where: { id: input.id },
      include: programInclude,
    })

    try {
      assertClinicianCanMutateProgram(source, user.id)
    } catch (error) {
      throw new ORPCError('FORBIDDEN', {
        message: error instanceof Error ? error.message : 'Forbidden',
      })
    }

    const newProgramId = generateUUID()
    const now = new Date()
    const copiedExercises = buildCopiedProgramExercises(
      source.exercises,
      newProgramId,
      generateUUID,
    )

    const program = await prisma.$transaction(async (tx) => {
      await tx.reusableProgram.create({
        data: {
          id: newProgramId,
          name: buildCopiedProgramName(source.name),
          kind: 'CLINICIAN_OWNED',
          userId: user.id,
          createdAt: now,
          updatedAt: now,
          retiredAt: null,
        },
      })

      if (copiedExercises.length > 0) {
        await tx.reusableProgramExercise.createMany({
          data: copiedExercises,
        })
      }

      return tx.reusableProgram.findFirstOrThrow({
        where: { id: newProgramId },
        include: programInclude,
      })
    })

    captureProgramCreated(context, program.id, 'copy')
    return program
  })

export const reusableProgram = {
  list: listReusablePrograms,
  listStarterTemplates,
  find: findReusableProgram,
  create: createReusableProgram,
  update: updateReusableProgram,
  retire: retireReusableProgram,
  copy: copyReusableProgram,
}
