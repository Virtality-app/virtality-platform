export type MosaicAmbientVideoPlaybackState = {
  prefersReducedMotion: boolean
  isIntersecting: boolean
  lightboxOpen?: boolean
}

export function shouldPlayMosaicAmbientVideo({
  prefersReducedMotion,
  isIntersecting,
  lightboxOpen = false,
}: MosaicAmbientVideoPlaybackState): boolean {
  return !lightboxOpen && !prefersReducedMotion && isIntersecting
}
