import type { ExtendedPatientSession } from '@/types/models'

/** A test Immersive Session; `endedAt` defaults to 12 minutes after `at`. */
export function immersiveSessionFixture(
  id: string,
  at: string,
  options: {
    status?: 'COMPLETED' | 'INTERRUPTED'
    title?: string
    activity?: 'CYCLING' | 'WALKING'
    minutes?: number
    lastPositionSec?: number | null
    videoDurationSec?: number | null
  } = {},
): ExtendedPatientSession {
  const status = options.status ?? 'COMPLETED'
  const startedAt = new Date(at)
  const endedAt = new Date(
    startedAt.getTime() + (options.minutes ?? 12) * 60_000,
  )
  return {
    id,
    patientId: 'patient-1',
    programId: null,
    kind: 'IMMERSIVE_VIDEO',
    status,
    sourceReusableProgramId: null,
    sourceProgramName: null,
    nprs: null,
    notes: null,
    deletedAt: null,
    createdAt: startedAt,
    completedAt: status === 'COMPLETED' ? endedAt : null,
    sessionExercise: [],
    sessionData: [],
    sessionImmersiveVideo: {
      id: `${id}-video`,
      patientSessionId: id,
      immersiveVideoId: 'video-1',
      videoTitle: options.title ?? 'Lakeside ride',
      activity: options.activity ?? 'CYCLING',
      videoDurationSec:
        options.videoDurationSec === undefined ? 900 : options.videoDurationSec,
      startedAt,
      endedAt,
      lastPositionSec:
        options.lastPositionSec === undefined ? 600 : options.lastPositionSec,
      endReason: status === 'COMPLETED' ? 'STOPPED' : 'INTERRUPTED',
    },
  } as ExtendedPatientSession
}
