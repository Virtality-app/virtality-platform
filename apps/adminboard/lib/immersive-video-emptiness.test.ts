import { describe, expect, it } from 'vitest'
import { isImmersiveVideoEmpty } from './immersive-video-emptiness'

describe('immersive video emptiness', () => {
  it('treats a blank draft as empty', () => {
    expect(
      isImmersiveVideoEmpty({
        title: '',
        description: null,
      }),
    ).toBe(true)
  })

  it('ignores activity-only changes, matching discardIfEmpty', () => {
    expect(
      isImmersiveVideoEmpty({
        title: '',
        description: '',
      }),
    ).toBe(true)
  })

  it('keeps a row that only has a description', () => {
    expect(
      isImmersiveVideoEmpty({
        title: '',
        description: 'Coastal loop',
      }),
    ).toBe(false)
  })

  it('keeps a row with a thumbnail, file, or open upload', () => {
    expect(
      isImmersiveVideoEmpty({
        title: '',
        description: null,
        thumbnailUrl: 'https://cdn.example/thumb.jpg',
      }),
    ).toBe(false)
    expect(
      isImmersiveVideoEmpty({
        title: '',
        description: null,
        filename: 'trail.mp4',
      }),
    ).toBe(false)
    expect(
      isImmersiveVideoEmpty({
        title: '',
        description: null,
        uploadId: 'upload-1',
      }),
    ).toBe(false)
  })
})
