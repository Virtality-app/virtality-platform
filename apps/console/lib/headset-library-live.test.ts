import { describe, expect, it } from 'vitest'
import {
  applyDownloadComplete,
  applyDownloadFailed,
  applyDownloadProgress,
} from './headset-library-live.js'

describe('headset library live updates', () => {
  it('records download progress on the matching video', () => {
    const next = applyDownloadProgress(
      { videos: [], freeBytes: 9 },
      {
        videoId: 'trail',
        bytesDownloaded: 10,
        sizeBytes: 40,
        stalled: false,
      },
    )

    expect(next.videos).toEqual([
      {
        videoId: 'trail',
        status: 'downloading',
        bytesDownloaded: 10,
        sizeBytes: 40,
        stalled: false,
      },
    ])
  })

  it('marks a completed video ready at the reported version', () => {
    const next = applyDownloadComplete(
      {
        videos: [{ videoId: 'trail', status: 'downloading' }],
        freeBytes: 9,
      },
      { videoId: 'trail', version: 4 },
    )

    expect(next.videos[0]).toMatchObject({
      status: 'ready',
      version: 4,
    })
  })

  it('drops a cancelled video so the row returns to absent', () => {
    const next = applyDownloadFailed(
      {
        videos: [{ videoId: 'trail', status: 'downloading' }],
        freeBytes: 9,
      },
      { videoId: 'trail', reason: 'cancelled' },
    )

    expect(next.videos).toEqual([])
  })
})
