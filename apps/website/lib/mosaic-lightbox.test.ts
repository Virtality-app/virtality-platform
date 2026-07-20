import { describe, expect, it } from 'vitest'
import { getMosaicLightboxContent } from './mosaic-lightbox'

describe('mosaic lightbox content', () => {
  it('maps image tiles to enlarged lightbox image props', () => {
    expect(
      getMosaicLightboxContent({
        id: 'tile-1',
        objectKey: 'marketing/mosaic/clinic.jpg',
        mediaKind: 'image',
        alt: 'Therapist guiding a patient',
        row: 0,
        col: 0,
        width: 1,
        height: 1,
        cdnUrl: 'https://cdn.virtality.app/marketing/mosaic/clinic.jpg',
      }),
    ).toEqual({
      kind: 'image',
      src: 'https://cdn.virtality.app/marketing/mosaic/clinic.jpg',
      alt: 'Therapist guiding a patient',
    })
  })

  it('maps video tiles to lightbox video props with controls-ready metadata', () => {
    expect(
      getMosaicLightboxContent({
        id: 'tile-2',
        objectKey: 'marketing/mosaic/clip.mp4',
        mediaKind: 'video',
        alt: 'Clinic walkthrough',
        row: 1,
        col: 1,
        width: 1,
        height: 1,
        cdnUrl: 'https://cdn.virtality.app/marketing/mosaic/clip.mp4',
      }),
    ).toEqual({
      kind: 'video',
      src: 'https://cdn.virtality.app/marketing/mosaic/clip.mp4',
      alt: 'Clinic walkthrough',
      mimeType: 'video/mp4',
    })
  })
})
