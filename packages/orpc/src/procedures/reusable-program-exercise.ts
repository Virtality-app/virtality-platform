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

/** Another clinician's program is FORBIDDEN; a bad exercise list is BAD_REQUEST. */
function assertCanWriteExercises(
  program: Parameters<typeof assertClinicianCanMutateProgram>[0],
  userId: string,
  exercises: z.infer<typeof ReusableProgramExercisesSchema>['exercises'],
) {
  try {
    assertClinicianCanMutateProgram(program, userId)
  } catch (error) {
    throw new ORPCError(program ? 'FORBIDDEN' : 'NOT_FOUND', {
      message: error instanceof Error ? error.message : 'Forbidden',
    })
  }
  try {
    validateUniqueExercisePositions(exercises)
  } catch (error) {
    throw new ORPCError('BAD_REQUEST', {
      message: error instanceof Error ? error.message : 'Invalid request',
    })
  }
}

const createReusableProgramExercises = authed
  .route({ path: '/reusable-program-exercise/create-many', method: 'POST' })
  .input(ReusableProgramExercisesSchema)
  .handler(async ({ context, input }) => {
    const { prisma, user } = context

    const program = await prisma.reusableProgram.findFirst({
      where: { id: input.reusableProgramId },
    })

    assertCanWriteExercises(program, user.id, input.exercises)

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

    assertCanWriteExercises(program, user.id, input.exercises)

    const prevExercises = await prisma.reusableProgramExercise.findMany({
      where: { reusableProgramId: input.reusableProgramId },
    })

    const {
      toDelete: exercisesToDelete,
      toCreate: exercisesToCreate,
      toUpdate: exercisesToUpdate,
    } = diffById(prevExercises, input.exercises)

    await prisma.$transaction(async (tx) => {
      if (exercisesToDelete.length > 0) {
        await tx.reusableProgramExercise.deleteMany({
          where: {
            id: { in: exercisesToDelete.map((exercise) => exercise.id) },
          },
        })
      }

      // `position` is unique per program, so a reorder written row by row
      // collides with a row that has not moved yet. Park the survivors at
      // negative positions first so every final position is free.
      for (const [index, exercise] of exercisesToUpdate.entries()) {
        await tx.reusableProgramExercise.update({
          where: { id: exercise.id },
          data: { position: -(index + 1) },
        })
      }

      if (exercisesToCreate.length > 0) {
        await tx.reusableProgramExercise.createMany({
          data: exercisesToCreate.map((exercise) => ({
            ...exercise,
            reusableProgramId: input.reusableProgramId,
          })),
        })
      }

      for (const exercise of exercisesToUpdate) {
        await tx.reusableProgramExercise.update({
          where: { id: exercise.id },
          data: { ...exercise, reusableProgramId: input.reusableProgramId },
        })
      }
    })
  })

export const reusableProgramExercise = {
  createMany: createReusableProgramExercises,
  updateMany: updateReusableProgramExercises,
}
