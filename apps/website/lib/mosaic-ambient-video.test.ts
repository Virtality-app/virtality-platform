import { describe, expect, it } from 'vitest'
import { shouldPlayMosaicAmbientVideo } from './mosaic-ambient-video'

describe('mosaic ambient video playback', () => {
  it('plays only when in view and reduced motion is not preferred', () => {
    expect(
      shouldPlayMosaicAmbientVideo({
        prefersReducedMotion: false,
        isIntersecting: true,
      }),
    ).toBe(true)

    expect(
      shouldPlayMosaicAmbientVideo({
        prefersReducedMotion: true,
        isIntersecting: true,
      }),
    ).toBe(false)

    expect(
      shouldPlayMosaicAmbientVideo({
        prefersReducedMotion: false,
        isIntersecting: false,
      }),
    ).toBe(false)
  })
})
