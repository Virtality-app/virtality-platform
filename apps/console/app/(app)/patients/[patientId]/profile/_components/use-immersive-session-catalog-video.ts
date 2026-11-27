'use client'

import { useImmersiveVideoList } from '@virtality/react-query'

/**
 * The catalog entry behind an Immersive Session, if the video is still
 * published. History keeps its own copy of title and activity, so this only
 * adds the thumbnail and tells the card whether to say "Not in catalog".
 */
export function useImmersiveSessionCatalogVideo(videoId: string | null) {
  const { data, isPending } = useImmersiveVideoList()
  const video = videoId
    ? data?.videos.find((entry) => entry.id === videoId)
    : undefined
  return {
    thumbnailUrl: video?.thumbnailUrl ?? null,
    /** False only once the list loaded without the video. */
    inCatalog: Boolean(video) || (videoId != null && isPending),
  }
}
