import { describe, expect, it } from 'vitest'
import { getMosaicImageTileProps } from './mosaic-tile'

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
})
