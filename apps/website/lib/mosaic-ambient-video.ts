export type MosaicAmbientVideoPlaybackState = {
  prefersReducedMotion: boolean
  isIntersecting: boolean
}

export function shouldPlayMosaicAmbientVideo({
  prefersReducedMotion,
  isIntersecting,
}: MosaicAmbientVideoPlaybackState): boolean {
  return !prefersReducedMotion && isIntersecting
}
