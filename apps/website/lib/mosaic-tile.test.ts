import { describe, expect, it } from 'vitest'
import {
  getMosaicImageTileProps,
  MOSAIC_GRID_MOBILE_SCALE_CLASS,
} from './mosaic-tile'

describe('mosaic image tile rendering', () => {
  it('maps live image tiles to accessible CDN image props', () => {
    expect(
      getMosaicImageTileProps({
        mediaKind: 'image',
        cdnUrl: 'https://cdn.virtality.app/marketing/mosaic/clinic.jpg',
        alt: 'Therapist guiding a patient',
      }),
    ).toEqual({
      src: 'https://cdn.virtality.app/marketing/mosaic/clinic.jpg',
      alt: 'Therapist guiding a patient',
    })
  })

  it('ignores non-image tiles until ambient video playback ships', () => {
    expect(
      getMosaicImageTileProps({
        mediaKind: 'video',
        cdnUrl: 'https://cdn.virtality.app/marketing/mosaic/clip.mp4',
        alt: 'Clinic walkthrough',
      }),
    ).toBeNull()
  })

  it('keeps a scaled mobile wrapper class for the fixed 3×3 composition', () => {
    expect(MOSAIC_GRID_MOBILE_SCALE_CLASS).toMatch(/scale-/)
    expect(MOSAIC_GRID_MOBILE_SCALE_CLASS).toMatch(/sm:scale-100/)
  })
})
