import i18next from '@/i18n/i18next'
import type { HeadsetLibraryWriteError } from '@virtality/react-query'

/**
 * Only the physio's own click deserves a toast; the headset-driven writes
 * are repaired by the next full `videoLibraryState` and are logged instead.
 */
export function mirrorWriteErrorMessage(
  error: HeadsetLibraryWriteError,
): string | null {
  if (error.procedure !== 'requestDownload') return null
  if (error.code === 'NOT_FOUND') {
    return i18next.t('mirrorError.notFound')
  }
  if (error.code === 'UNAUTHORIZED') {
    return i18next.t('mirrorError.unauthorized')
  }
  return i18next.t('mirrorError.generic')
}
