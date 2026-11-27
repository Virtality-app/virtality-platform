'use client'

import { useEffect, useEffectEvent, useRef } from 'react'
import {
  getQueryClient,
  useEndImmersiveSession,
  useORPC,
  useStartImmersiveSession,
} from '@virtality/react-query'
import { generateUUID } from '@virtality/shared/utils'
import {
  decideImmersiveSessionRecord,
  type ImmersiveSessionRecordStep,
} from '@/lib/immersive-session-record'
import type { ImmersivePlaybackState } from '@/lib/immersive-video-playback-reducer'

type OpenSession = {
  videoId: string
  /** Known at once for a new session; filled in by the lookup on resume. */
  id: string | null
}

/**
 * Saves each **Immersive Video** the headset plays as an **Immersive
 * Session**: started on the play-ack, ended on `videoEnded`, `videoStopAck` or
 * headset loss. Saves run one after another in the background, so a slow or
 * failed save never holds up playback.
 */
export function useImmersiveSessionRecord(input: {
  state: ImmersivePlaybackState
  patientId: string
  roomCode: string | undefined
  timeLimitFired: () => boolean
}) {
  const { state } = input
  const orpc = useORPC()
  const queryClient = getQueryClient()
  const { mutateAsync: startImmersive } = useStartImmersiveSession()
  const { mutateAsync: endImmersive } = useEndImmersiveSession()

  const prevStateRef = useRef(state)
  const openRef = useRef<OpenSession | null>(null)
  const queueRef = useRef<Promise<void>>(Promise.resolve())

  const enqueue = (save: () => Promise<void>) => {
    queueRef.current = queueRef.current.then(save).catch((error) => {
      console.error('Immersive session save failed', error)
    })
  }

  const refreshSessions = () =>
    queryClient.invalidateQueries({
      queryKey: orpc.patientSession.list.key({
        input: { where: { patientId: input.patientId } },
      }),
    })

  const start = (session: OpenSession, id: string) =>
    startImmersive({
      id,
      patientId: input.patientId,
      immersiveVideoId: session.videoId,
      roomCode: input.roomCode,
    })

  const runStep = (step: ImmersiveSessionRecordStep) => {
    if (step.kind === 'end') {
      const session = openRef.current
      openRef.current = null
      if (!session) return
      enqueue(async () => {
        if (!session.id) return
        await endImmersive({
          sessionId: session.id,
          endReason: step.endReason,
          lastPositionSec: step.lastPositionSec,
        })
        await refreshSessions()
      })
      return
    }

    if (step.kind === 'start') {
      const session: OpenSession = { videoId: step.videoId, id: generateUUID() }
      openRef.current = session
      const id = session.id!
      enqueue(async () => {
        await start(session, id)
        await refreshSessions()
      })
      return
    }

    // A reload mid-video: carry on with the session the earlier page opened.
    const session: OpenSession = { videoId: step.videoId, id: null }
    openRef.current = session
    enqueue(async () => {
      // The API's filter takes no relation fields, so match the video here.
      const openSessions = await orpc.patientSession.list.call({
        where: {
          patientId: input.patientId,
          kind: 'IMMERSIVE_VIDEO',
          status: 'ACTIVE',
        },
        orderBy: { createdAt: 'desc' },
      })
      const active = openSessions.find(
        (open) => open.sessionImmersiveVideo?.immersiveVideoId === step.videoId,
      )
      if (active) {
        session.id = active.id
        return
      }
      const id = generateUUID()
      await start(session, id)
      session.id = id
      await refreshSessions()
    })
  }

  const onStateChange = useEffectEvent((next: ImmersivePlaybackState) => {
    const prev = prevStateRef.current
    prevStateRef.current = next
    const steps = decideImmersiveSessionRecord(prev, next, {
      openVideoId: openRef.current?.videoId ?? null,
      timeLimitFired: input.timeLimitFired(),
    })
    steps.forEach(runStep)
  })

  useEffect(() => {
    onStateChange(state)
  }, [state])
}
