import { describe, expect, it } from 'vitest'
import {
  IMMERSIVE_VIDEO_PART_SIZE_BYTES,
  planImmersiveVideoParts,
  resumeImmersiveVideoPartNumbers,
} from './immersive-video-upload-plan'

describe('immersive video upload plan', () => {
  it('slices a 0-byte file into no parts', () => {
    expect(planImmersiveVideoParts(0)).toEqual({ partCount: 0, parts: [] })
  })

  it('slices a 1-byte file into one remainder part', () => {
    expect(planImmersiveVideoParts(1)).toEqual({
      partCount: 1,
      parts: [{ partNumber: 1, start: 0, end: 1, size: 1 }],
    })
  })

  it('slices 64 MiB minus one as a single part', () => {
    const size = IMMERSIVE_VIDEO_PART_SIZE_BYTES - 1
    expect(planImmersiveVideoParts(size)).toEqual({
      partCount: 1,
      parts: [{ partNumber: 1, start: 0, end: size, size }],
    })
  })

  it('slices exactly 64 MiB as one full part', () => {
    expect(planImmersiveVideoParts(IMMERSIVE_VIDEO_PART_SIZE_BYTES)).toEqual({
      partCount: 1,
      parts: [
        {
          partNumber: 1,
          start: 0,
          end: IMMERSIVE_VIDEO_PART_SIZE_BYTES,
          size: IMMERSIVE_VIDEO_PART_SIZE_BYTES,
        },
      ],
    })
  })

  it('slices 64 MiB plus one into a full part and a remainder', () => {
    const size = IMMERSIVE_VIDEO_PART_SIZE_BYTES + 1
    expect(planImmersiveVideoParts(size)).toEqual({
      partCount: 2,
      parts: [
        {
          partNumber: 1,
          start: 0,
          end: IMMERSIVE_VIDEO_PART_SIZE_BYTES,
          size: IMMERSIVE_VIDEO_PART_SIZE_BYTES,
        },
        {
          partNumber: 2,
          start: IMMERSIVE_VIDEO_PART_SIZE_BYTES,
          end: size,
          size: 1,
        },
      ],
    })
  })

  it('slices 6.4 GB into sequential 64 MiB parts', () => {
    const size = 6.4 * 1000 * 1000 * 1000
    const plan = planImmersiveVideoParts(size)
    expect(plan.partCount).toBe(
      Math.ceil(size / IMMERSIVE_VIDEO_PART_SIZE_BYTES),
    )
    expect(plan.parts[0]).toMatchObject({
      partNumber: 1,
      start: 0,
      size: IMMERSIVE_VIDEO_PART_SIZE_BYTES,
    })
    const last = plan.parts.at(-1)
    expect(last?.end).toBe(size)
    expect(last?.size).toBe(size % IMMERSIVE_VIDEO_PART_SIZE_BYTES)
  })

  it('resume planner returns missing part numbers', () => {
    expect(resumeImmersiveVideoPartNumbers([1, 2, 4], 5)).toEqual([3, 5])
    expect(resumeImmersiveVideoPartNumbers([], 3)).toEqual([1, 2, 3])
    expect(resumeImmersiveVideoPartNumbers([1, 2, 3], 3)).toEqual([])
  })
})
