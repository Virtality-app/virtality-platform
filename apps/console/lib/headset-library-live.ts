import type {
  VideoDownloadCompletePayload,
  VideoDownloadFailedPayload,
  VideoDownloadPausedPayload,
  VideoDownloadProgressPayload,
  VideoLibraryEntry,
  VideoLibraryStatePayload,
} from '@virtality/shared/types'

export type LiveLibraryEntry = VideoLibraryEntry & {
  stalled?: boolean
}

export type LiveLibraryState = {
  videos: LiveLibraryEntry[]
  freeBytes: number
}

export function upsertLibraryEntry(
  state: LiveLibraryState | VideoLibraryStatePayload | null,
  videoId: string,
  patch: Partial<LiveLibraryEntry> & Pick<LiveLibraryEntry, 'status'>,
): LiveLibraryState {
  const videos = state?.videos ?? []
  const previous = videos.find((entry) => entry.videoId === videoId)
  const nextEntry: LiveLibraryEntry = {
    ...previous,
    ...patch,
    videoId,
  }
  return {
    freeBytes: state?.freeBytes ?? 0,
    videos: [...videos.filter((entry) => entry.videoId !== videoId), nextEntry],
  }
}

export function applyDownloadProgress(
  state: LiveLibraryState | VideoLibraryStatePayload | null,
  payload: VideoDownloadProgressPayload,
): LiveLibraryState {
  return upsertLibraryEntry(state, payload.videoId, {
    status: 'downloading',
    bytesDownloaded: payload.bytesDownloaded,
    sizeBytes: payload.sizeBytes,
    stalled: payload.stalled,
  })
}

export function applyDownloadComplete(
  state: LiveLibraryState | VideoLibraryStatePayload | null,
  payload: VideoDownloadCompletePayload,
): LiveLibraryState {
  return upsertLibraryEntry(state, payload.videoId, {
    status: 'ready',
    version: payload.version,
    stalled: false,
  })
}

export function applyDownloadFailed(
  state: LiveLibraryState | VideoLibraryStatePayload | null,
  payload: VideoDownloadFailedPayload,
): LiveLibraryState {
  if (payload.reason === 'cancelled') {
    return {
      freeBytes: state?.freeBytes ?? 0,
      videos: (state?.videos ?? []).filter(
        (entry) => entry.videoId !== payload.videoId,
      ),
    }
  }

  return upsertLibraryEntry(state, payload.videoId, {
    status: 'failed',
    reason: payload.reason,
  })
}

export function applyDownloadPaused(
  state: LiveLibraryState | VideoLibraryStatePayload | null,
  payload: VideoDownloadPausedPayload,
): LiveLibraryState {
  return upsertLibraryEntry(state, payload.videoId, {
    status: 'paused',
    bytesDownloaded: payload.bytesDownloaded,
    stalled: false,
  })
}
