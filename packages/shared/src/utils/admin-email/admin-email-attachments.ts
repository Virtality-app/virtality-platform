/** Total bytes of every attachment on one Admin-authored Email. */
export const ADMIN_EMAIL_ATTACHMENT_MAX_TOTAL_BYTES = 10 * 1024 * 1024

export const ADMIN_EMAIL_ATTACHMENT_MAX_COUNT = 5

export const ADMIN_EMAIL_ATTACHMENT_CONTENT_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
] as const

export type AdminEmailAttachmentContentType =
  (typeof ADMIN_EMAIL_ATTACHMENT_CONTENT_TYPES)[number]

/** Value for a file input's `accept` attribute. */
export const ADMIN_EMAIL_ATTACHMENT_ACCEPT =
  ADMIN_EMAIL_ATTACHMENT_CONTENT_TYPES.join(',')

/** First entry is the one appended when a filename's extension is wrong. */
const ATTACHMENT_EXTENSIONS: Record<
  AdminEmailAttachmentContentType,
  [string, ...string[]]
> = {
  'application/pdf': ['pdf'],
  'image/png': ['png'],
  'image/jpeg': ['jpg', 'jpeg'],
  'image/gif': ['gif'],
  'image/webp': ['webp'],
}

const ATTACHMENT_KEY_PREFIX = 'email-attachments'

const MAX_FILENAME_LENGTH = 100

const startsWithBytes = (bytes: Uint8Array, signature: number[], offset = 0) =>
  bytes.length >= offset + signature.length &&
  signature.every((byte, index) => bytes[offset + index] === byte)

const ascii = (text: string) => [...text].map((char) => char.charCodeAt(0))

/**
 * Identifies an allowed attachment type from the file's leading bytes. The
 * browser-reported type and the filename are ignored: both are caller-chosen.
 */
export const detectAdminEmailAttachmentContentType = (
  bytes: Uint8Array,
): AdminEmailAttachmentContentType | null => {
  if (startsWithBytes(bytes, ascii('%PDF-'))) {
    return 'application/pdf'
  }

  if (
    startsWithBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  ) {
    return 'image/png'
  }

  if (startsWithBytes(bytes, [0xff, 0xd8, 0xff])) {
    return 'image/jpeg'
  }

  if (
    startsWithBytes(bytes, ascii('GIF87a')) ||
    startsWithBytes(bytes, ascii('GIF89a'))
  ) {
    return 'image/gif'
  }

  if (
    startsWithBytes(bytes, ascii('RIFF')) &&
    startsWithBytes(bytes, ascii('WEBP'), 8)
  ) {
    return 'image/webp'
  }

  return null
}

/**
 * A filename safe for an S3 key and a mail header: no path, no control or
 * unusual characters, bounded length, and an extension matching the detected
 * type.
 */
export const sanitizeAdminEmailAttachmentFilename = (
  filename: string,
  contentType: AdminEmailAttachmentContentType,
): string => {
  const extensions = ATTACHMENT_EXTENSIONS[contentType]
  const baseName = filename.split(/[/\\]/).pop() ?? ''
  const dotIndex = baseName.lastIndexOf('.')
  const currentExtension =
    dotIndex > 0 ? baseName.slice(dotIndex + 1).toLowerCase() : ''
  const hasMatchingExtension = extensions.includes(currentExtension)
  const stem = hasMatchingExtension ? baseName.slice(0, dotIndex) : baseName
  const extension = hasMatchingExtension ? currentExtension : extensions[0]

  const cleanStem =
    stem
      .normalize('NFC')
      .replace(/[^\p{L}\p{N}_.\- ()]+/gu, '_')
      .replace(/\s+/g, ' ')
      .replace(/_+/g, '_')
      .replace(/^[\s._]+|[\s._]+$/g, '')
      .slice(0, MAX_FILENAME_LENGTH - extension.length - 1) || 'attachment'

  return `${cleanStem}.${extension}`
}

export const buildAdminEmailAttachmentObjectKey = ({
  draftId,
  attachmentId,
  filename,
}: {
  draftId: string
  attachmentId: string
  filename: string
}) => `${ATTACHMENT_KEY_PREFIX}/${draftId}/${attachmentId}-${filename}`

/** Null when the draft can take the new file, otherwise the reason it can't. */
export const validateAdminEmailAttachmentAddition = ({
  existingSizes,
  newSize,
}: {
  existingSizes: number[]
  newSize: number
}): string | null => {
  if (newSize <= 0) {
    return 'attachment is empty'
  }

  if (existingSizes.length >= ADMIN_EMAIL_ATTACHMENT_MAX_COUNT) {
    return `an email can have at most ${ADMIN_EMAIL_ATTACHMENT_MAX_COUNT} attachments`
  }

  return validateAdminEmailAttachmentTotal([...existingSizes, newSize])
}

/** Null when the attachments together fit the per-email size limit. */
export const validateAdminEmailAttachmentTotal = (
  sizes: number[],
): string | null => {
  const total = sizes.reduce((sum, size) => sum + size, 0)

  if (total > ADMIN_EMAIL_ATTACHMENT_MAX_TOTAL_BYTES) {
    return `attachments must total ${formatAdminEmailAttachmentSize(ADMIN_EMAIL_ATTACHMENT_MAX_TOTAL_BYTES)} or less`
  }

  return null
}

export const formatAdminEmailAttachmentSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }

  const oneDecimal = (value: number) => value.toFixed(1).replace(/\.0$/, '')

  if (bytes < 1024 * 1024 * 1024) {
    return `${oneDecimal(bytes / (1024 * 1024))} MB`
  }

  return `${oneDecimal(bytes / (1024 * 1024 * 1024))} GB`
}
