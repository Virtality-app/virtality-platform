import { ORPCError } from '@orpc/server'

export const IMMERSIVE_SESSION_END_REASONS = [
  'ENDED',
  'STOPPED',
  'TIME_LIMIT',
  'INTERRUPTED',
] as const

export type ImmersiveSessionEndReason =
  (typeof IMMERSIVE_SESSION_END_REASONS)[number]

type ImmersiveVideoActivity = 'CYCLING' | 'WALKING'

type StartImmersiveDelegates<TPatientSession> = {
  patient: {
    findFirst: (args: {
      where: { id: string; userId: string; deletedAt: null }
      select: { id: true }
    }) => Promise<{ id: string } | null>
  }
  immersiveVideo: {
    findUnique: (args: {
      where: { id: string }
      select: { id: true; title: true; activity: true; durationSec: true }
    }) => Promise<{
      id: string
      title: string
      activity: ImmersiveVideoActivity
      durationSec: number | null
    } | null>
  }
  patientSession: {
    create: (args: {
      data: {
        id: string
        patientId: string
        kind: 'IMMERSIVE_VIDEO'
        status: 'ACTIVE'
        sessionImmersiveVideo: {
          create: {
            immersiveVideoId: string
            videoTitle: string
            activity: ImmersiveVideoActivity
            videoDurationSec: number | null
          }
        }
      }
      include: { sessionImmersiveVideo: true }
    }) => Promise<TPatientSession>
  }
}

/**
 * Starts an immersive video session once the headset confirms play. The
 * video's title, activity and length are copied onto the session so its
 * history survives the video leaving the catalog.
 */
export async function startImmersivePatientSession<TPatientSession>(
  deps: StartImmersiveDelegates<TPatientSession>,
  userId: string,
  input: { id: string; patientId: string; immersiveVideoId: string },
): Promise<{ session: TPatientSession; activity: ImmersiveVideoActivity }> {
  const patient = await deps.patient.findFirst({
    where: { id: input.patientId, userId, deletedAt: null },
    select: { id: true },
  })
  if (!patient) {
    throw new ORPCError('NOT_FOUND', { message: 'Patient not found' })
  }

  const video = await deps.immersiveVideo.findUnique({
    where: { id: input.immersiveVideoId },
    select: { id: true, title: true, activity: true, durationSec: true },
  })
  if (!video) {
    throw new ORPCError('NOT_FOUND', { message: 'Immersive video not found' })
  }

  const session = await deps.patientSession.create({
    data: {
      id: input.id,
      patientId: patient.id,
      kind: 'IMMERSIVE_VIDEO',
      status: 'ACTIVE',
      sessionImmersiveVideo: {
        create: {
          immersiveVideoId: video.id,
          videoTitle: video.title,
          activity: video.activity,
          videoDurationSec: video.durationSec,
        },
      },
    },
    include: { sessionImmersiveVideo: true },
  })

  return { session, activity: video.activity }
}

type EndImmersiveData = {
  status: 'COMPLETED' | 'INTERRUPTED'
  completedAt?: Date
  sessionImmersiveVideo: {
    update: {
      endedAt: Date
      lastPositionSec: number | undefined
      endReason: ImmersiveSessionEndReason
    }
  }
}

type EndImmersiveDelegates<TPatientSession> = {
  patientSession: {
    findFirst: (args: {
      where: { id: string; deletedAt: null; patient: { userId: string } }
      include: { sessionImmersiveVideo: true }
    }) => Promise<{
      id: string
      status: string
      kind: string
      sessionImmersiveVideo: {
        immersiveVideoId: string | null
        startedAt: Date
      } | null
    } | null>
    update: (args: {
      where: { id: string }
      data: EndImmersiveData
      include: { sessionImmersiveVideo: true }
    }) => Promise<TPatientSession>
  }
}

/**
 * Ends an active immersive video session. A lost headset leaves it
 * INTERRUPTED with no completion time, like an exercise session; every
 * other reason completes it. `endedAt` is set either way, so an
 * interrupted run still has a duration.
 */
export async function endImmersivePatientSession<TPatientSession>(
  deps: EndImmersiveDelegates<TPatientSession>,
  userId: string,
  input: {
    sessionId: string
    endReason: ImmersiveSessionEndReason
    lastPositionSec?: number
  },
  now: Date = new Date(),
): Promise<{
  session: TPatientSession
  videoId: string | null
  durationSec: number
}> {
  const session = await deps.patientSession.findFirst({
    where: { id: input.sessionId, deletedAt: null, patient: { userId } },
    include: { sessionImmersiveVideo: true },
  })
  if (!session) {
    throw new ORPCError('NOT_FOUND', { message: 'Patient session not found' })
  }

  const video = session.sessionImmersiveVideo
  if (
    session.kind !== 'IMMERSIVE_VIDEO' ||
    session.status !== 'ACTIVE' ||
    !video
  ) {
    throw new ORPCError('BAD_REQUEST', {
      message: 'Only an active immersive video session can be ended',
    })
  }

  const interrupted = input.endReason === 'INTERRUPTED'
  const updated = await deps.patientSession.update({
    where: { id: session.id },
    data: {
      status: interrupted ? 'INTERRUPTED' : 'COMPLETED',
      ...(interrupted ? {} : { completedAt: now }),
      sessionImmersiveVideo: {
        update: {
          endedAt: now,
          lastPositionSec: input.lastPositionSec,
          endReason: input.endReason,
        },
      },
    },
    include: { sessionImmersiveVideo: true },
  })

  return {
    session: updated,
    videoId: video.immersiveVideoId,
    durationSec: Math.max(
      0,
      Math.round((now.getTime() - video.startedAt.getTime()) / 1000),
    ),
  }
}
