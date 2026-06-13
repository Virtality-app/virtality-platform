import { ORPCError } from '@orpc/server'
import { ReusableProgramExerciseSchema } from '@virtality/db/definitions'
import {
  assertClinicianCanMutateProgram,
  diffById,
  validateUniqueExercisePositions,
} from '@virtality/shared/utils'
import { authed } from '../middleware/auth.ts'
import { z } from 'zod'

export const ReusableProgramExercisesSchema = z.object({
  reusableProgramId: z.string(),
  exercises: z.array(ReusableProgramExerciseSchema),
})

const createReusableProgramExercises = authed
  .route({ path: '/reusable-program-exercise/create-many', method: 'POST' })
  .input(ReusableProgramExercisesSchema)
  .handler(async ({ context, input }) => {
    const { prisma, user } = context

    const program = await prisma.reusableProgram.findFirst({
      where: { id: input.reusableProgramId },
    })

    try {
      assertClinicianCanMutateProgram(program, user.id)
      validateUniqueExercisePositions(input.exercises)
    } catch (error) {
      throw new ORPCError('BAD_REQUEST', {
        message: error instanceof Error ? error.message : 'Invalid request',
      })
    }

    await prisma.reusableProgramExercise.createMany({
      data: input.exercises.map((exercise) => ({
        ...exercise,
        reusableProgramId: input.reusableProgramId,
      })),
    })
  })

const updateReusableProgramExercises = authed
  .route({ path: '/reusable-program-exercise/update-many', method: 'PUT' })
  .input(ReusableProgramExercisesSchema)
  .handler(async ({ context, input }) => {
    const { prisma, user } = context

    const program = await prisma.reusableProgram.findFirst({
      where: { id: input.reusableProgramId },
    })

    try {
      assertClinicianCanMutateProgram(program, user.id)
      validateUniqueExercisePositions(input.exercises)
    } catch (error) {
      throw new ORPCError('BAD_REQUEST', {
        message: error instanceof Error ? error.message : 'Invalid request',
      })
    }

    const prevExercises = await prisma.reusableProgramExercise.findMany({
      where: { reusableProgramId: input.reusableProgramId },
    })

    const {
      toDelete: exercisesToDelete,
      toCreate: exercisesToCreate,
      toUpdate: exercisesToUpdate,
    } = diffById(prevExercises, input.exercises)

    await prisma.$transaction(async () => {
      if (exercisesToDelete.length > 0) {
        await prisma.reusableProgramExercise.deleteMany({
          where: {
            id: { in: exercisesToDelete.map((exercise) => exercise.id) },
          },
        })
      }

      if (exercisesToCreate.length > 0) {
        await prisma.reusableProgramExercise.createMany({
          data: exercisesToCreate.map((exercise) => ({
            ...exercise,
            reusableProgramId: input.reusableProgramId,
          })),
        })
      }

      if (exercisesToUpdate.length > 0) {
        for (const exercise of exercisesToUpdate) {
          await prisma.reusableProgramExercise.update({
            where: { id: exercise.id },
            data: exercise,
          })
        }
      }
    })
  })

export const reusableProgramExercise = {
  createMany: createReusableProgramExercises,
  updateMany: updateReusableProgramExercises,
}
