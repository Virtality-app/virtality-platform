import { ORPCError } from '@orpc/server'
import type { PrismaClient } from '@virtality/db'
import {
  getTranslationBundle,
  listTranslations,
  resetTranslation,
  TranslationValidationError,
  upsertTranslation,
  type TranslationStore,
} from '@virtality/shared/utils'
import { z } from 'zod'
import { base } from '../context.ts'
import { adminAuthed } from '../middleware/admin.ts'

const statusSchema = z.enum(['missing', 'needs-review', 'outdated', 'done'])
const keyInputSchema = z.object({
  locale: z.string(),
  namespace: z.string(),
  key: z.string(),
})

function createPrismaTranslationStore(prisma: PrismaClient): TranslationStore {
  return {
    listByLocale: (locale, namespace) =>
      prisma.translation.findMany({
        where: { locale, ...(namespace ? { namespace } : {}) },
      }),
    upsert: ({ locale, namespace, key, ...data }) =>
      prisma.translation.upsert({
        where: { locale_namespace_key: { locale, namespace, key } },
        create: { locale, namespace, key, ...data },
        update: data,
      }),
    deleteByKey: async ({ locale, namespace, key }) => {
      await prisma.translation.deleteMany({
        where: { locale, namespace, key },
      })
    },
  }
}

async function withTranslationErrors<T>(operation: () => Promise<T>) {
  try {
    return await operation()
  } catch (error) {
    if (error instanceof TranslationValidationError) {
      throw new ORPCError('BAD_REQUEST', { message: error.message })
    }
    throw error
  }
}

const bundleProcedure = base
  .route({ path: '/translation/bundle', method: 'GET' })
  .input(z.object({ locale: z.string(), namespace: z.string() }))
  .handler(({ context, input }) =>
    withTranslationErrors(() =>
      getTranslationBundle(createPrismaTranslationStore(context.prisma), input),
    ),
  )

const listProcedure = adminAuthed
  .route({ path: '/translation/list', method: 'GET' })
  .input(
    z.object({
      locale: z.string().optional(),
      namespace: z.string().optional(),
      status: statusSchema.optional(),
    }),
  )
  .handler(({ context, input }) =>
    withTranslationErrors(() =>
      listTranslations(createPrismaTranslationStore(context.prisma), input),
    ),
  )

const upsertProcedure = adminAuthed
  .route({ path: '/translation/upsert', method: 'POST' })
  .input(keyInputSchema.extend({ value: z.string().min(1) }))
  .handler(({ context, input }) =>
    withTranslationErrors(async () => {
      const row = await upsertTranslation(
        createPrismaTranslationStore(context.prisma),
        input,
        context.user?.id ?? null,
      )
      return { ...row }
    }),
  )

const resetProcedure = adminAuthed
  .route({ path: '/translation/reset', method: 'DELETE' })
  .input(keyInputSchema)
  .handler(({ context, input }) =>
    withTranslationErrors(async () => {
      await resetTranslation(
        createPrismaTranslationStore(context.prisma),
        input,
      )
      return { ...input }
    }),
  )

export const translation = {
  bundle: bundleProcedure,
  list: listProcedure,
  upsert: upsertProcedure,
  reset: resetProcedure,
}
