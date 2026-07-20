import { describe, expect, it } from 'vitest'
import { filterBucketMp4PickerObjects } from './promo-video'

describe('filterBucketMp4PickerObjects', () => {
  it('filters picker objects to mp4 videos only', () => {
    const objects = [
      {
        type: 'object' as const,
        name: 'demo.mp4',
        objectKey: 'marketing/videos/demo.mp4',
        cdnUrl: 'https://cdn.example/marketing/videos/demo.mp4',
        contentType: 'video/mp4',
        size: 10,
        lastModified: null,
      },
      {
        type: 'object' as const,
        name: 'demo.webm',
        objectKey: 'marketing/videos/demo.webm',
        cdnUrl: 'https://cdn.example/marketing/videos/demo.webm',
        contentType: 'video/webm',
        size: 10,
        lastModified: null,
      },
      {
        type: 'object' as const,
        name: 'poster.png',
        objectKey: 'marketing/videos/poster.png',
        cdnUrl: 'https://cdn.example/marketing/videos/poster.png',
        contentType: 'image/png',
        size: 10,
        lastModified: null,
      },
    ]

    expect(filterBucketMp4PickerObjects(objects, '')).toEqual([objects[0]])
    expect(filterBucketMp4PickerObjects(objects, 'demo')).toEqual([objects[0]])
    expect(filterBucketMp4PickerObjects(objects, 'poster')).toEqual([])
  })
})
