import { describe, expect, it, vi } from 'vitest'
import {
  endImmersivePatientSession,
  startImmersivePatientSession,
} from './session-immersive.ts'

const video = {
  id: 'video-1',
  title: 'Alpine Lake Ride',
  activity: 'CYCLING' as const,
  durationSec: 1080,
}

function startDeps({
  patientFound = true,
  videoFound = true,
}: { patientFound?: boolean; videoFound?: boolean } = {}) {
  return {
    patient: {
      findFirst: vi
        .fn()
        .mockResolvedValue(patientFound ? { id: 'patient-1' } : null),
    },
    immersiveVideo: {
      findUnique: vi.fn().mockResolvedValue(videoFound ? video : null),
    },
    patientSession: {
      create: vi.fn().mockImplementation(async ({ data }) => ({
        id: data.id,
        sessionImmersiveVideo: { ...data.sessionImmersiveVideo.create },
      })),
    },
  }
}

const startInput = {
  id: 'session-1',
  patientId: 'patient-1',
  immersiveVideoId: 'video-1',
}

describe('startImmersivePatientSession', () => {
  it('creates an active immersive session with a snapshot of the video', async () => {
    const deps = startDeps()

    await startImmersivePatientSession(deps, 'user-1', startInput)

    expect(deps.patient.findFirst).toHaveBeenCalledWith({
      where: { id: 'patient-1', userId: 'user-1', deletedAt: null },
      select: { id: true },
    })
    expect(deps.patientSession.create).toHaveBeenCalledWith({
      data: {
        id: 'session-1',
        patientId: 'patient-1',
        kind: 'IMMERSIVE_VIDEO',
        status: 'ACTIVE',
        sessionImmersiveVideo: {
          create: {
            immersiveVideoId: 'video-1',
            videoTitle: 'Alpine Lake Ride',
            activity: 'CYCLING',
            videoDurationSec: 1080,
          },
        },
      },
      include: { sessionImmersiveVideo: true },
    })
  })

  it('refuses a patient the caller does not own', async () => {
    const deps = startDeps({ patientFound: false })

    await expect(
      startImmersivePatientSession(deps, 'user-1', startInput),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })
    expect(deps.patientSession.create).not.toHaveBeenCalled()
  })

  it('refuses a video that is not in the catalog', async () => {
    const deps = startDeps({ videoFound: false })

    await expect(
      startImmersivePatientSession(deps, 'user-1', startInput),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })
    expect(deps.patientSession.create).not.toHaveBeenCalled()
  })
})

const startedAt = new Date('2026-11-12T14:20:00.000Z')
const now = new Date('2026-11-12T14:38:00.000Z')

function endDeps(
  session: {
    status?: string
    kind?: string
    hasVideo?: boolean
  } | null = {},
) {
  const found =
    session === null
      ? null
      : {
          id: 'session-1',
          status: session.status ?? 'ACTIVE',
          kind: session.kind ?? 'IMMERSIVE_VIDEO',
          sessionImmersiveVideo:
            session.hasVideo === false
              ? null
              : { immersiveVideoId: 'video-1', startedAt },
        }
  return {
    patientSession: {
      findFirst: vi.fn().mockResolvedValue(found),
      update: vi.fn().mockImplementation(async ({ data }) => ({
        id: 'session-1',
        ...data,
      })),
    },
  }
}

describe('endImmersivePatientSession', () => {
  it.each([
    ['ENDED', 'COMPLETED'],
    ['STOPPED', 'COMPLETED'],
    ['TIME_LIMIT', 'COMPLETED'],
  ] as const)(
    'completes the session when it ends with %s',
    async (endReason, status) => {
      const deps = endDeps()

      const result = await endImmersivePatientSession(
        deps,
        'user-1',
        { sessionId: 'session-1', endReason, lastPositionSec: 750 },
        now,
      )

      expect(deps.patientSession.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'session-1',
          deletedAt: null,
          patient: { userId: 'user-1' },
        },
        include: { sessionImmersiveVideo: true },
      })
      expect(deps.patientSession.update).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        data: {
          status,
          completedAt: now,
          sessionImmersiveVideo: {
            update: { endedAt: now, lastPositionSec: 750, endReason },
          },
        },
        include: { sessionImmersiveVideo: true },
      })
      expect(result.durationSec).toBe(18 * 60)
      expect(result.videoId).toBe('video-1')
    },
  )

  it('marks the session interrupted without a completion time when the headset is lost', async () => {
    const deps = endDeps()

    await endImmersivePatientSession(
      deps,
      'user-1',
      {
        sessionId: 'session-1',
        endReason: 'INTERRUPTED',
        lastPositionSec: 220,
      },
      now,
    )

    expect(deps.patientSession.update).toHaveBeenCalledWith({
      where: { id: 'session-1' },
      data: {
        status: 'INTERRUPTED',
        sessionImmersiveVideo: {
          update: {
            endedAt: now,
            lastPositionSec: 220,
            endReason: 'INTERRUPTED',
          },
        },
      },
      include: { sessionImmersiveVideo: true },
    })
  })

  it('refuses a session the caller does not own or that does not exist', async () => {
    const deps = endDeps(null)

    await expect(
      endImmersivePatientSession(
        deps,
        'user-1',
        { sessionId: 'session-1', endReason: 'ENDED' },
        now,
      ),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it.each([
    ['an exercise session', { kind: 'EXERCISE' }],
    ['a session that already ended', { status: 'COMPLETED' }],
    ['a session without its video row', { hasVideo: false }],
  ])('refuses %s', async (_label, session) => {
    const deps = endDeps(session)

    await expect(
      endImmersivePatientSession(
        deps,
        'user-1',
        { sessionId: 'session-1', endReason: 'ENDED' },
        now,
      ),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
    expect(deps.patientSession.update).not.toHaveBeenCalled()
  })
})
