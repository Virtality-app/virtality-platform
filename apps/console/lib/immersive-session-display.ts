import type { SessionImmersiveVideo } from '@virtality/db'
import { formatDurationLabel } from '@/lib/headset-library-format'

export type ImmersiveWatched = {
  /** `m:ss` of the last reported position; `null` when none was reported. */
  watched: string | null
  /** `m:ss` of the video's length; `null` when the catalog has none. */
  total: string | null
  /** Share of the video watched, 0–100; `null` without both numbers. */
  percent: number | null
}

/** How much of the video an Immersive Session got through. */
export function getImmersiveWatched(
  video: Pick<SessionImmersiveVideo, 'lastPositionSec' | 'videoDurationSec'>,
): ImmersiveWatched {
  const { lastPositionSec, videoDurationSec } = video
  const percent =
    lastPositionSec != null && videoDurationSec
      ? Math.min(100, Math.round((lastPositionSec / videoDurationSec) * 100))
      : null
  return {
    watched: formatDurationLabel(lastPositionSec),
    total: formatDurationLabel(videoDurationSec),
    percent,
  }
}
