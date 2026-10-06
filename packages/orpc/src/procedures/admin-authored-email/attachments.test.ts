import { describe, expect, it, vi } from 'vitest'
import {
  copyAttachmentsToDraft,
  loadAttachmentContents,
  mapAttachment,
  uploadDraftAttachment,
  type AttachmentRow,
  type AttachmentS3,
} from './attachments.ts'

const PDF_BYTES = [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]

const createS3 = (overrides: Partial<AttachmentS3> = {}): AttachmentS3 => ({
  uploadFile: vi.fn(async () => ({ $metadata: {} })),
  deleteFile: vi.fn(async () => ({ $metadata: {} })),
  copyObject: vi.fn(async () => true),
  getFileBytes: vi.fn(async () => new Uint8Array(PDF_BYTES)),
  ...overrides,
})

const pdfFile = (name = 'report.pdf') =>
  new File([new Uint8Array(PDF_BYTES)], name, { type: 'application/pdf' })

const row = (overrides: Partial<AttachmentRow> = {}): AttachmentRow => ({
  id: 'att-1',
  objectKey: 'email-attachments/draft-1/att-1-report.pdf',
  filename: 'report.pdf',
  contentType: 'application/pdf',
  size: PDF_BYTES.length,
  ...overrides,
})

describe('uploadDraftAttachment', () => {
  it('stores the file under the draft with its detected type', async () => {
    const s3 = createS3()

    const attachment = await uploadDraftAttachment({
      s3,
      draftId: 'draft-1',
      existing: [],
      file: pdfFile('../June report.PDF'),
    })

    expect(attachment).toMatchObject({
      filename: 'June report.pdf',
      contentType: 'application/pdf',
      size: PDF_BYTES.length,
    })
    expect(attachment.objectKey).toBe(
      `email-attachments/draft-1/${attachment.id}-June report.pdf`,
    )
    expect(s3.uploadFile).toHaveBeenCalledWith(
      expect.objectContaining({
        Key: attachment.objectKey,
        ContentType: 'application/pdf',
      }),
    )
  })

  it('rejects a file whose bytes are not an allowed type, whatever it is called', async () => {
    const s3 = createS3()

    await expect(
      uploadDraftAttachment({
        s3,
        draftId: 'draft-1',
        existing: [],
        file: new File(['<svg onload="alert(1)"/>'], 'logo.png', {
          type: 'image/png',
        }),
      }),
    ).rejects.toThrow('only PDF, PNG, JPEG, GIF and WebP files can be attached')
    expect(s3.uploadFile).not.toHaveBeenCalled()
  })

  it('rejects a file that would push the email past its limits before uploading', async () => {
    const s3 = createS3()

    await expect(
      uploadDraftAttachment({
        s3,
        draftId: 'draft-1',
        existing: [row({ size: 10 * 1024 * 1024 })],
        file: pdfFile(),
      }),
    ).rejects.toThrow('attachments must total 10 MB or less')
    expect(s3.uploadFile).not.toHaveBeenCalled()
  })

  it('fails when the upload fails', async () => {
    const s3 = createS3({ uploadFile: vi.fn(async () => null) })

    await expect(
      uploadDraftAttachment({
        s3,
        draftId: 'draft-1',
        existing: [],
        file: pdfFile(),
      }),
    ).rejects.toThrow('failed to store attachment')
  })
})

describe('copyAttachmentsToDraft', () => {
  it('copies each object under the new draft with a new id', async () => {
    const s3 = createS3()

    const [copy] = await copyAttachmentsToDraft({
      s3,
      draftId: 'draft-2',
      attachments: [row()],
    })

    expect(copy?.id).not.toBe('att-1')
    expect(copy?.objectKey).toBe(
      `email-attachments/draft-2/${copy?.id}-report.pdf`,
    )
    expect(s3.copyObject).toHaveBeenCalledWith({
      sourceKey: 'email-attachments/draft-1/att-1-report.pdf',
      destinationKey: copy?.objectKey,
    })
  })

  it('deletes the copies already made when a later copy fails', async () => {
    const s3 = createS3({
      copyObject: vi
        .fn()
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false),
    })

    await expect(
      copyAttachmentsToDraft({
        s3,
        draftId: 'draft-2',
        attachments: [row(), row({ id: 'att-2', filename: 'photo.png' })],
      }),
    ).rejects.toThrow('failed to copy attachment photo.png')

    expect(s3.deleteFile).toHaveBeenCalledTimes(1)
    expect(s3.deleteFile).toHaveBeenCalledWith({
      Key: expect.stringMatching(
        /^email-attachments\/draft-2\/.+-report\.pdf$/,
      ),
    })
  })
})

describe('loadAttachmentContents', () => {
  it('loads every attachment for sending', async () => {
    const contents = await loadAttachmentContents(createS3(), [row()])

    expect(contents).toEqual([
      {
        filename: 'report.pdf',
        content: new Uint8Array(PDF_BYTES),
        contentType: 'application/pdf',
      },
    ])
  })

  it('refuses to send when an object is missing', async () => {
    const s3 = createS3({ getFileBytes: vi.fn(async () => null) })

    await expect(loadAttachmentContents(s3, [row()])).rejects.toThrow(
      'attachment report.pdf could not be loaded; nothing was sent',
    )
  })
})

describe('mapAttachment', () => {
  it('encodes the object key in the download URL', () => {
    expect(
      mapAttachment(
        row({ objectKey: 'email-attachments/d/a-Αναφορά Ιουνίου.pdf' }),
      ).url,
    ).toMatch(
      /\/email-attachments\/d\/a-%CE%91%CE%BD%CE%B1%CF%86%CE%BF%CF%81%CE%AC%20/,
    )
  })
})
