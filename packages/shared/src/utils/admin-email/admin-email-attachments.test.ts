import { describe, expect, it } from 'vitest'
import {
  ADMIN_EMAIL_ATTACHMENT_MAX_COUNT,
  ADMIN_EMAIL_ATTACHMENT_MAX_TOTAL_BYTES,
  buildAdminEmailAttachmentObjectKey,
  detectAdminEmailAttachmentContentType,
  formatAdminEmailAttachmentSize,
  sanitizeAdminEmailAttachmentFilename,
  validateAdminEmailAttachmentAddition,
  validateAdminEmailAttachmentTotal,
} from './admin-email-attachments.ts'

const bytesOf = (...parts: (string | number[])[]) =>
  new Uint8Array(
    parts.flatMap((part) =>
      typeof part === 'string'
        ? [...part].map((char) => char.charCodeAt(0))
        : part,
    ),
  )

describe('detectAdminEmailAttachmentContentType', () => {
  it('recognises PDFs and the allowed image formats by their leading bytes', () => {
    expect(detectAdminEmailAttachmentContentType(bytesOf('%PDF-1.7'))).toBe(
      'application/pdf',
    )
    expect(
      detectAdminEmailAttachmentContentType(
        bytesOf([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]),
      ),
    ).toBe('image/png')
    expect(
      detectAdminEmailAttachmentContentType(bytesOf([0xff, 0xd8, 0xff, 0xe0])),
    ).toBe('image/jpeg')
    expect(detectAdminEmailAttachmentContentType(bytesOf('GIF89a'))).toBe(
      'image/gif',
    )
    expect(
      detectAdminEmailAttachmentContentType(
        bytesOf('RIFF', [0, 0, 0, 0], 'WEBPVP8 '),
      ),
    ).toBe('image/webp')
  })

  it('rejects SVG, HTML, executables and truncated files', () => {
    expect(
      detectAdminEmailAttachmentContentType(bytesOf('<svg xmlns="">')),
    ).toBeNull()
    expect(
      detectAdminEmailAttachmentContentType(bytesOf('<!DOCTYPE html>')),
    ).toBeNull()
    expect(detectAdminEmailAttachmentContentType(bytesOf('MZ'))).toBeNull()
    expect(detectAdminEmailAttachmentContentType(bytesOf('%PD'))).toBeNull()
    expect(
      detectAdminEmailAttachmentContentType(bytesOf('RIFF', [0, 0, 0, 0])),
    ).toBeNull()
  })
})

describe('sanitizeAdminEmailAttachmentFilename', () => {
  it('keeps a plain name with a matching extension', () => {
    expect(
      sanitizeAdminEmailAttachmentFilename(
        'June report (final).PDF',
        'application/pdf',
      ),
    ).toBe('June report (final).pdf')
  })

  it('keeps non-Latin letters such as Greek', () => {
    expect(
      sanitizeAdminEmailAttachmentFilename(
        'Αναφορά Ιουνίου.pdf',
        'application/pdf',
      ),
    ).toBe('Αναφορά Ιουνίου.pdf')
  })

  it('strips paths and replaces unsafe characters', () => {
    expect(
      sanitizeAdminEmailAttachmentFilename(
        '../../etc/pass"wd\r\n.png',
        'image/png',
      ),
    ).toBe('pass_wd.png')
    expect(
      sanitizeAdminEmailAttachmentFilename(
        'C:\\Users\\me\\photo.jpeg',
        'image/jpeg',
      ),
    ).toBe('photo.jpeg')
  })

  it('appends the extension of the detected type when the name disagrees', () => {
    expect(
      sanitizeAdminEmailAttachmentFilename('invoice.exe', 'application/pdf'),
    ).toBe('invoice.exe.pdf')
    expect(sanitizeAdminEmailAttachmentFilename('scan', 'image/jpeg')).toBe(
      'scan.jpg',
    )
  })

  it('falls back to a generic name and bounds the length', () => {
    expect(
      sanitizeAdminEmailAttachmentFilename('???.pdf', 'application/pdf'),
    ).toBe('attachment.pdf')
    expect(
      sanitizeAdminEmailAttachmentFilename(
        `${'a'.repeat(300)}.pdf`,
        'application/pdf',
      ).length,
    ).toBe(100)
  })
})

describe('buildAdminEmailAttachmentObjectKey', () => {
  it('groups attachments under the draft that owns them', () => {
    expect(
      buildAdminEmailAttachmentObjectKey({
        draftId: 'draft-1',
        attachmentId: 'att-1',
        filename: 'report.pdf',
      }),
    ).toBe('email-attachments/draft-1/att-1-report.pdf')
  })
})

describe('validateAdminEmailAttachmentAddition', () => {
  it('accepts a file that fits the count and total size', () => {
    expect(
      validateAdminEmailAttachmentAddition({
        existingSizes: [1024],
        newSize: 2048,
      }),
    ).toBeNull()
  })

  it('rejects empty files', () => {
    expect(
      validateAdminEmailAttachmentAddition({ existingSizes: [], newSize: 0 }),
    ).toBe('attachment is empty')
  })

  it('rejects a file past the count limit', () => {
    expect(
      validateAdminEmailAttachmentAddition({
        existingSizes: Array(ADMIN_EMAIL_ATTACHMENT_MAX_COUNT).fill(1),
        newSize: 1,
      }),
    ).toMatch(/at most 5 attachments/)
  })

  it('rejects a file that pushes the total over 10 MB', () => {
    expect(
      validateAdminEmailAttachmentAddition({
        existingSizes: [ADMIN_EMAIL_ATTACHMENT_MAX_TOTAL_BYTES - 10],
        newSize: 11,
      }),
    ).toBe('attachments must total 10 MB or less')
  })
})

describe('validateAdminEmailAttachmentTotal', () => {
  it('allows exactly the limit', () => {
    expect(
      validateAdminEmailAttachmentTotal([
        ADMIN_EMAIL_ATTACHMENT_MAX_TOTAL_BYTES,
      ]),
    ).toBeNull()
  })
})

describe('formatAdminEmailAttachmentSize', () => {
  it('formats bytes, kilobytes, megabytes and gigabytes', () => {
    expect(formatAdminEmailAttachmentSize(512)).toBe('512 B')
    expect(formatAdminEmailAttachmentSize(2048)).toBe('2 KB')
    expect(formatAdminEmailAttachmentSize(1.5 * 1024 * 1024)).toBe('1.5 MB')
    expect(formatAdminEmailAttachmentSize(10 * 1024 * 1024)).toBe('10 MB')
    expect(formatAdminEmailAttachmentSize(13 * 1024 * 1024 * 1024)).toBe(
      '13 GB',
    )
  })
})
