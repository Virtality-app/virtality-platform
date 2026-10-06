import { ORPCError } from '@orpc/server'
import {
  bucketCdnUrl,
  buildAdminEmailAttachmentObjectKey,
  detectAdminEmailAttachmentContentType,
  generateUUID,
  sanitizeAdminEmailAttachmentFilename,
  validateAdminEmailAttachmentAddition,
  validateAdminEmailAttachmentTotal,
  type EmailAttachmentContent,
} from '@virtality/shared/utils'
import type { VirtalityS3Client } from '../../s3/index.ts'

export type AttachmentS3 = Pick<
  VirtalityS3Client,
  'uploadFile' | 'deleteFile' | 'copyObject' | 'getFileBytes'
>

export const attachmentSelect = {
  id: true,
  objectKey: true,
  filename: true,
  contentType: true,
  size: true,
} as const

export const attachmentInclude = {
  select: attachmentSelect,
  orderBy: { createdAt: 'asc' },
} as const

export type AttachmentRow = {
  id: string
  objectKey: string
  filename: string
  contentType: string
  size: number
}

export const mapAttachment = (attachment: AttachmentRow) => ({
  id: attachment.id,
  filename: attachment.filename,
  contentType: attachment.contentType,
  size: attachment.size,
  url: bucketCdnUrl(
    attachment.objectKey.split('/').map(encodeURIComponent).join('/'),
  ),
})

/**
 * Checks the file against the per-email limits and its real type, then
 * uploads it. Returns the row to create; the caller deletes the object if
 * saving the row fails.
 */
export const uploadDraftAttachment = async ({
  s3,
  draftId,
  existing,
  file,
}: {
  s3: AttachmentS3
  draftId: string
  existing: AttachmentRow[]
  file: File
}) => {
  const limitError = validateAdminEmailAttachmentAddition({
    existingSizes: existing.map((attachment) => attachment.size),
    newSize: file.size,
  })
  if (limitError) {
    throw new ORPCError('BAD_REQUEST', { message: limitError })
  }

  const bytes = new Uint8Array(await file.arrayBuffer())
  const contentType = detectAdminEmailAttachmentContentType(bytes)
  if (!contentType) {
    throw new ORPCError('BAD_REQUEST', {
      message: 'only PDF, PNG, JPEG, GIF and WebP files can be attached',
    })
  }

  const id = generateUUID()
  const filename = sanitizeAdminEmailAttachmentFilename(file.name, contentType)
  const objectKey = buildAdminEmailAttachmentObjectKey({
    draftId,
    attachmentId: id,
    filename,
  })

  const uploaded = await s3.uploadFile({
    Key: objectKey,
    Body: bytes,
    ContentType: contentType,
  })
  if (!uploaded) {
    throw new ORPCError('INTERNAL_SERVER_ERROR', {
      message: 'failed to store attachment',
    })
  }

  return { id, objectKey, filename, contentType, size: bytes.byteLength }
}

/**
 * Gives each attachment its own copy under the target draft, so removing one
 * from a clone never deletes an object a sent record still points at. On a
 * failed copy, the copies made so far are deleted and the clone is refused.
 */
export const copyAttachmentsToDraft = async ({
  s3,
  draftId,
  attachments,
}: {
  s3: AttachmentS3
  draftId: string
  attachments: AttachmentRow[]
}) => {
  const copies: AttachmentRow[] = []

  for (const attachment of attachments) {
    const id = generateUUID()
    const objectKey = buildAdminEmailAttachmentObjectKey({
      draftId,
      attachmentId: id,
      filename: attachment.filename,
    })

    const copied = await s3.copyObject({
      sourceKey: attachment.objectKey,
      destinationKey: objectKey,
    })

    if (!copied) {
      await deleteAttachmentObjects(s3, copies)
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: `failed to copy attachment ${attachment.filename}`,
      })
    }

    copies.push({ ...attachment, id, objectKey })
  }

  return copies
}

export const deleteAttachmentObjects = async (
  s3: AttachmentS3,
  attachments: Pick<AttachmentRow, 'objectKey'>[],
) => {
  await Promise.all(
    attachments.map(({ objectKey }) => s3.deleteFile({ Key: objectKey })),
  )
}

/**
 * Reads every attachment before anything is sent, so a missing object fails
 * the whole send up front instead of failing each recipient in turn.
 */
export const loadAttachmentContents = async (
  s3: AttachmentS3,
  attachments: AttachmentRow[],
): Promise<EmailAttachmentContent[]> => {
  const totalError = validateAdminEmailAttachmentTotal(
    attachments.map((attachment) => attachment.size),
  )
  if (totalError) {
    throw new ORPCError('BAD_REQUEST', { message: totalError })
  }

  return Promise.all(
    attachments.map(async (attachment) => {
      const content = await s3.getFileBytes({ Key: attachment.objectKey })
      if (!content) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: `attachment ${attachment.filename} could not be loaded; nothing was sent`,
        })
      }

      return {
        filename: attachment.filename,
        content,
        contentType: attachment.contentType,
      }
    }),
  )
}
