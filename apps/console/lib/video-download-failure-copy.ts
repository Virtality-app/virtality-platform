import type { VideoDownloadFailureReason } from '@virtality/shared/types'
import type { Translate } from '@/i18n/translate'

export type VideoDownloadFailureAction = 'Download' | 'Download (fresh)' | null

export type VideoDownloadFailureCopy = {
  copy: string | null
  action: VideoDownloadFailureAction
}

const FAILURE_ACTION: Record<
  VideoDownloadFailureReason,
  VideoDownloadFailureAction
> = {
  insufficient_storage: 'Download',
  network: 'Download',
  checksum_mismatch: 'Download (fresh)',
  url_expired: 'Download',
  unavailable: null,
}

export function videoDownloadFailureCopy(
  reason: VideoDownloadFailureReason,
  t: Translate,
): VideoDownloadFailureCopy {
  return {
    copy: t(`failure.${reason}`, { ns: 'vr-video' }),
    action: FAILURE_ACTION[reason],
  }
}
