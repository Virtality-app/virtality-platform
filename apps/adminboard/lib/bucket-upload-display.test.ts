import { describe, expect, it } from 'vitest'
import { formatBucketUploadFileCount } from './bucket-upload-display'

describe('formatBucketUploadFileCount', () => {
  it('uses singular copy for one file', () => {
    expect(formatBucketUploadFileCount(1)).toBe('1 file selected.')
  })

  it('uses plural copy for multiple files', () => {
    expect(formatBucketUploadFileCount(3)).toBe('3 files selected.')
  })
})
