import type { BucketObjectRow } from '@virtality/shared/utils'
import { describe, expect, it } from 'vitest'
import {
  filterMosaicMediaPickerObjects,
  inferMosaicMediaKindFromContentType,
  isMosaicMediaContentType,
} from './mosaic-media-picker'

const objects: BucketObjectRow[] = [
  {
    type: 'object',
    name: 'hero.png',
    objectKey: 'hero.png',
    cdnUrl: 'https://cdn.example/hero.png',
    contentType: 'image/png',
    size: 100,
    lastModified: null,
  },
  {
    type: 'object',
    name: 'clip.mp4',
    objectKey: 'clips/clip.mp4',
    cdnUrl: 'https://cdn.example/clips/clip.mp4',
    contentType: 'video/mp4',
    size: 200,
    lastModified: null,
  },
  {
    type: 'object',
    name: 'notes.txt',
    objectKey: 'notes.txt',
    cdnUrl: 'https://cdn.example/notes.txt',
    contentType: 'text/plain',
    size: 10,
    lastModified: null,
  },
]

describe('mosaic media picker helpers', () => {
  it('accepts jpeg, png, webp images and mp4, webm, mov videos', () => {
    expect(isMosaicMediaContentType('image/jpeg')).toBe(true)
    expect(isMosaicMediaContentType('image/png')).toBe(true)
    expect(isMosaicMediaContentType('image/webp')).toBe(true)
    expect(isMosaicMediaContentType('video/mp4')).toBe(true)
    expect(isMosaicMediaContentType('video/webm')).toBe(true)
    expect(isMosaicMediaContentType('video/quicktime')).toBe(true)
    expect(isMosaicMediaContentType('text/plain')).toBe(false)
    expect(isMosaicMediaContentType('image/gif')).toBe(false)
  })

  it('infers mosaic media kinds from supported content types', () => {
    expect(inferMosaicMediaKindFromContentType('image/png')).toBe('image')
    expect(inferMosaicMediaKindFromContentType('video/mp4')).toBe('video')
    expect(inferMosaicMediaKindFromContentType('text/plain')).toBeNull()
  })

  it('filters bucket listings down to supported mosaic media', () => {
    expect(filterMosaicMediaPickerObjects(objects, '')).toEqual([
      objects[0],
      objects[1],
    ])
    expect(filterMosaicMediaPickerObjects(objects, 'clip')).toEqual([
      objects[1],
    ])
  })
})
