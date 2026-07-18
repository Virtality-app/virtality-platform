import { describe, expect, it } from 'vitest'
import {
  formatBucketUploadFileCount,
  getBucketUploadSelectedFileNames,
} from './bucket-upload-display'

describe('formatBucketUploadFileCount', () => {
  it('uses singular copy for one file', () => {
    expect(formatBucketUploadFileCount(1)).toBe('1 file selected.')
  })

  it('uses plural copy for multiple files', () => {
    expect(formatBucketUploadFileCount(3)).toBe('3 files selected.')
  })
})

describe('getBucketUploadSelectedFileNames', () => {
  it('returns file names in selection order', () => {
    const files = [
      { name: 'short.png' },
      {
        name: 'this-is-an-extremely-long-filename-that-would-overflow-the-dialog-without-truncation.png',
      },
    ]

    expect(getBucketUploadSelectedFileNames(files as File[])).toEqual([
      'short.png',
      'this-is-an-extremely-long-filename-that-would-overflow-the-dialog-without-truncation.png',
    ])
  })
})
