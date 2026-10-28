import { describe, expect, it } from 'vitest'
import { VIDEO_DOWNLOAD_FAILURE_REASON } from '@virtality/shared/types'
import { createTestI18n } from '@/i18n/test-i18n'
import { videoDownloadFailureCopy } from './video-download-failure-copy.js'

const i18n = createTestI18n()
const t = i18n.t.bind(i18n)

describe('videoDownloadFailureCopy', () => {
  it('maps insufficient_storage to space copy and Download', () => {
    expect(
      videoDownloadFailureCopy(
        VIDEO_DOWNLOAD_FAILURE_REASON.InsufficientStorage,
        t,
      ),
    ).toEqual({
      copy: 'Not enough space on the headset. Free up space and try again.',
      action: 'Download',
    })
  })

  it('maps network to retry copy and Download', () => {
    expect(
      videoDownloadFailureCopy(VIDEO_DOWNLOAD_FAILURE_REASON.Network, t),
    ).toEqual({
      copy: 'The download failed. Try again.',
      action: 'Download',
    })
  })

  it('maps checksum_mismatch to corruption copy and a fresh Download', () => {
    expect(
      videoDownloadFailureCopy(
        VIDEO_DOWNLOAD_FAILURE_REASON.ChecksumMismatch,
        t,
      ),
    ).toEqual({
      copy: 'The file was corrupted in transfer. Try again.',
      action: 'Download (fresh)',
    })
  })
})

it('maps url_expired to the same retry copy as network', () => {
  expect(
    videoDownloadFailureCopy(VIDEO_DOWNLOAD_FAILURE_REASON.UrlExpired, t),
  ).toEqual({
    copy: 'The download failed. Try again.',
    action: 'Download',
  })
})

it('maps unavailable to no action', () => {
  expect(
    videoDownloadFailureCopy(VIDEO_DOWNLOAD_FAILURE_REASON.Unavailable, t),
  ).toEqual({
    copy: 'This video is no longer available.',
    action: null,
  })
})
