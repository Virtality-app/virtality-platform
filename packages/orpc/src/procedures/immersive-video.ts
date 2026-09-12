import { ORPCError } from '@orpc/server'
import { z } from 'zod/v4'
import { authed } from '../middleware/auth.ts'
import { adminAuthed } from '../middleware/admin.ts'
import {
  ImmersiveVideoError,
  ImmersiveVideoNotFoundError,
} from './immersive-video-constants.ts'
import { createImmersiveVideoS3 } from './immersive-video-s3.ts'
import {
  abortImmersiveVideoUpload,
  completeImmersiveVideoUpload,
  createImmersiveVideo,
  deleteImmersiveVideo,
  discardImmersiveVideoIfEmpty,
  getImmersiveVideo,
  immersiveVideoUploadStatus,
  listImmersiveVideoCatalog,
  listPublishedImmersiveVideos,
  publishImmersiveVideo,
  setImmersiveVideoThumbnail,
  startImmersiveVideoUpload,
  unpublishImmersiveVideo,
  updateImmersiveVideo,
  uploadImmersiveVideoPart,
  type ImmersiveVideoPrisma,
} from './immersive-video-service.ts'
import { runImmersiveVideoVerify } from './immersive-video-verify.ts'

const idInput = z.object({ id: z.string().min(1) })

const updateInput = z.object({
  id: z.string().min(1),
  title: z.string().max(120).optional(),
  activity: z.enum(['CYCLING', 'WALKING']).optional(),
  description: z.string().max(500).nullable().optional(),
})

const thumbnailInput = z.object({
  id: z.string().min(1),
  file: z.instanceof(File),
})

const uploadStartInput = z.object({
  id: z.string().min(1),
  filename: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  contentType: z.string().min(1),
  durationSec: z.number().int().nonnegative().nullable().optional(),
})

const uploadPartInput = z.object({
  id: z.string().min(1),
  partNumber: z.number().int().positive(),
  part: z.instanceof(File),
})

function throwImmersiveVideoOrpcError(error: unknown): never {
  if (error instanceof ImmersiveVideoNotFoundError) {
    throw new ORPCError('NOT_FOUND', { message: error.message })
  }
  if (error instanceof ImmersiveVideoError) {
    throw new ORPCError('BAD_REQUEST', { message: error.message })
  }
  throw error
}

async function withImmersiveVideoErrors<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run()
  } catch (error) {
    throwImmersiveVideoOrpcError(error)
  }
}

function depsFromContext(context: {
  prisma: ImmersiveVideoPrisma
  s3: Parameters<typeof createImmersiveVideoS3>[0]
}) {
  return {
    prisma: context.prisma,
    s3: createImmersiveVideoS3(context.s3),
  }
}

const list = authed
  .route({ path: '/immersive-video/list', method: 'GET' })
  .handler(async ({ context }) => ({
    videos: await listPublishedImmersiveVideos(context.prisma),
  }))

const listCatalog = adminAuthed
  .route({ path: '/immersive-video/list-catalog', method: 'GET' })
  .handler(async ({ context }) =>
    withImmersiveVideoErrors(() =>
      listImmersiveVideoCatalog(depsFromContext(context)),
    ),
  )

const get = adminAuthed
  .route({ path: '/immersive-video/get', method: 'GET' })
  .input(idInput)
  .handler(async ({ context, input }) =>
    withImmersiveVideoErrors(() =>
      getImmersiveVideo(depsFromContext(context), input.id),
    ),
  )

const create = adminAuthed
  .route({ path: '/immersive-video/create', method: 'POST' })
  .handler(async ({ context }) =>
    withImmersiveVideoErrors(() =>
      createImmersiveVideo(depsFromContext(context)),
    ),
  )

const update = adminAuthed
  .route({ path: '/immersive-video/update', method: 'POST' })
  .input(updateInput)
  .handler(async ({ context, input }) =>
    withImmersiveVideoErrors(() =>
      updateImmersiveVideo(depsFromContext(context), input),
    ),
  )

const setThumbnail = adminAuthed
  .route({ path: '/immersive-video/set-thumbnail', method: 'POST' })
  .input(thumbnailInput)
  .handler(async ({ context, input }) =>
    withImmersiveVideoErrors(() =>
      setImmersiveVideoThumbnail(depsFromContext(context), input),
    ),
  )

const discardIfEmpty = adminAuthed
  .route({ path: '/immersive-video/discard-if-empty', method: 'POST' })
  .input(idInput)
  .handler(async ({ context, input }) =>
    withImmersiveVideoErrors(() =>
      discardImmersiveVideoIfEmpty(depsFromContext(context), input.id),
    ),
  )

const publish = adminAuthed
  .route({ path: '/immersive-video/publish', method: 'POST' })
  .input(idInput)
  .handler(async ({ context, input }) =>
    withImmersiveVideoErrors(() =>
      publishImmersiveVideo(depsFromContext(context), input.id),
    ),
  )

const unpublish = adminAuthed
  .route({ path: '/immersive-video/unpublish', method: 'POST' })
  .input(idInput)
  .handler(async ({ context, input }) =>
    withImmersiveVideoErrors(() =>
      unpublishImmersiveVideo(depsFromContext(context), input.id),
    ),
  )

const remove = adminAuthed
  .route({ path: '/immersive-video/delete', method: 'DELETE' })
  .input(idInput)
  .handler(async ({ context, input }) =>
    withImmersiveVideoErrors(() =>
      deleteImmersiveVideo(depsFromContext(context), input.id),
    ),
  )

const uploadStart = adminAuthed
  .route({ path: '/immersive-video/upload/start', method: 'POST' })
  .input(uploadStartInput)
  .handler(async ({ context, input }) =>
    withImmersiveVideoErrors(() =>
      startImmersiveVideoUpload(depsFromContext(context), input),
    ),
  )

const uploadPart = adminAuthed
  .route({ path: '/immersive-video/upload/part', method: 'POST' })
  .input(uploadPartInput)
  .handler(async ({ context, input }) =>
    withImmersiveVideoErrors(() =>
      uploadImmersiveVideoPart(depsFromContext(context), input),
    ),
  )

const uploadStatus = adminAuthed
  .route({ path: '/immersive-video/upload/status', method: 'GET' })
  .input(idInput)
  .handler(async ({ context, input }) =>
    withImmersiveVideoErrors(() =>
      immersiveVideoUploadStatus(depsFromContext(context), input.id),
    ),
  )

const uploadComplete = adminAuthed
  .route({ path: '/immersive-video/upload/complete', method: 'POST' })
  .input(idInput)
  .handler(async ({ context, input }) =>
    withImmersiveVideoErrors(() => {
      const deps = depsFromContext(context)
      return completeImmersiveVideoUpload(deps, input.id, (id) => {
        void runImmersiveVideoVerify(id, deps)
      })
    }),
  )

const uploadAbort = adminAuthed
  .route({ path: '/immersive-video/upload/abort', method: 'POST' })
  .input(idInput)
  .handler(async ({ context, input }) =>
    withImmersiveVideoErrors(() =>
      abortImmersiveVideoUpload(depsFromContext(context), input.id),
    ),
  )

export const immersiveVideo = {
  list,
  listCatalog,
  get,
  create,
  update,
  setThumbnail,
  discardIfEmpty,
  publish,
  unpublish,
  delete: remove,
  upload: {
    start: uploadStart,
    part: uploadPart,
    status: uploadStatus,
    complete: uploadComplete,
    abort: uploadAbort,
  },
}
