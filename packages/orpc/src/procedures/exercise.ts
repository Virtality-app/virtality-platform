import { ORPCError } from '@orpc/server'
import { z } from 'zod/v4'
import { updateExerciseFamilyMediaInputSchema } from '@virtality/shared/types'
import {
  DEFAULT_EXERCISE_EQUIPMENT_KEYS,
  normalizeExerciseEquipmentKey,
} from '@virtality/shared/utils'
import { authed } from '../middleware/auth.ts'
import { adminAuthed } from '../middleware/admin.ts'
import { ExerciseFindManyZodSchema } from '@virtality/db/definitions'
import {
  ExerciseFamilyNotFoundError,
  updateExerciseFamilyMedia,
} from './exercise-family-media-service.ts'

const listExercise = authed
  .route({ path: '/exercise/list', method: 'GET' })
  .input(
    ExerciseFindManyZodSchema.extend({
      includeDisabled: z.boolean().optional(),
    }),
  )
  .handler(async ({ context, input }) => {
    const { prisma } = context

    const { includeDisabled, orderBy, where } = input

    return prisma.exercise.findMany({
      where: { ...where, ...(!includeDisabled && { enabled: true }) },
      orderBy: orderBy ?? { id: 'asc' },
    })
  })

const listExerciseCategories = authed
  .route({ path: '/exercise/categories', method: 'GET' })
  .handler(async ({ context }) => {
    const { prisma } = context

    const rows = await prisma.exercise.findMany({
      where: { enabled: true },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    })

    return rows.map((row) => row.category)
  })

const listExerciseItems = authed
  .route({ path: '/exercise/items', method: 'GET' })
  .handler(async ({ context }) => {
    const { prisma } = context

    const rows = await prisma.exercise.findMany({
      where: { enabled: true },
      select: { item: true },
    })

    const keys = new Set<string>(DEFAULT_EXERCISE_EQUIPMENT_KEYS)
    for (const row of rows) {
      keys.add(normalizeExerciseEquipmentKey(row.item))
    }

    return [...keys].sort((a, b) => a.localeCompare(b))
  })

const updateFamilyMedia = adminAuthed
  .route({ path: '/exercise/update-family-media', method: 'POST' })
  .input(updateExerciseFamilyMediaInputSchema)
  .handler(async ({ context, input }) => {
    try {
      return await updateExerciseFamilyMedia(context.prisma, input)
    } catch (error) {
      if (error instanceof ExerciseFamilyNotFoundError) {
        throw new ORPCError('NOT_FOUND', { message: error.message })
      }
      throw error
    }
  })

export const exercise = {
  list: listExercise,
  listCategories: listExerciseCategories,
  listItems: listExerciseItems,
  updateFamilyMedia,
}
