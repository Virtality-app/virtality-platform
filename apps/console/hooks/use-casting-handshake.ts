'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { SocketWithQuery } from '@/types/models'
import { createDeviceEmitter, subscribe } from '@/lib/device-event-controller'
import { CASTING_EVENT } from '@virtality/shared/types'
import {
  SERVER_URL,
  SERVER_URL_LOCAL,
  SERVER_URL_STAGING,
} from '@virtality/shared/types'

const env = process.env.NEXT_PUBLIC_ENV || 'development'

const base =
  env === 'production'
    ? SERVER_URL
    : env === 'preview'
      ? SERVER_URL_STAGING
      : SERVER_URL_LOCAL

export type CastingStatus =
  | 'idle'
  | 'requesting'
  | 'negotiating'
  | 'connected'
  | 'error'

type IceServersResponse = {
  iceServers?: RTCIceServer[]
}

async function getCastingIceServers(): Promise<RTCIceServer[]> {
  const response = await fetch(`${base}/api/casting/ice-servers`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to load casting ICE servers')
  }

  const data = (await response.json()) as IceServersResponse

  if (!Array.isArray(data.iceServers) || data.iceServers.length === 0) {
    throw new Error('Casting ICE server response is empty')
  }

  return data.iceServers
}

/**
 * WebRTC casting handshake: console requests offer -> VR sends offer ->
 * console creates answer and sends it. Attaches remote video track to videoRef.
 * ICE servers are loaded from the backend so TURN credentials stay private.
 */
export function useCastingHandshake(socket: SocketWithQuery | null) {
  const [status, setStatus] = useState<CastingStatus>('idle')
  const videoRef = useRef<HTMLVideoElement>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const emitterRef = useRef<ReturnType<typeof createDeviceEmitter> | null>(null)
  const iceServersRef = useRef<RTCIceServer[]>([])

  const emitter = useMemo(
    () => (socket ? createDeviceEmitter(socket) : null),
    [socket],
  )

  useEffect(() => {
    emitterRef.current = emitter
  }, [emitter])

  const handleOffer = useCallback(
    async (offerJson: unknown) => {
      if (!socket || !emitter) return
      try {
        setStatus('negotiating')
        const offerDesc =
          typeof offerJson === 'string' ? JSON.parse(offerJson) : offerJson
        if (offerDesc && typeof offerDesc === 'object') {
          offerDesc.type =
            (offerDesc.type as string)?.toLowerCase?.() ?? 'offer'
        }

        const pc = new RTCPeerConnection({ iceServers: iceServersRef.current })
        pcRef.current = pc

        pc.ontrack = (event) => {
          if (videoRef.current?.srcObject) return
          if (event.streams?.[0]) {
            videoRef.current!.srcObject = event.streams[0]
          } else {
            videoRef.current!.srcObject = new MediaStream([event.track])
          }
          setStatus('connected')
        }

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            console.log('[casting] Local ICE candidate:', event.candidate.type)
          }
        }

        pc.onicegatheringstatechange = () => {
          console.log('[casting] ICE gathering state:', pc.iceGatheringState)
        }

        pc.oniceconnectionstatechange = () => {
          console.log('[casting] ICE connection state:', pc.iceConnectionState)
          if (pc.iceConnectionState === 'failed') {
            console.warn('[casting] ICE connection failed')
            setStatus('error')
          }
        }

        pc.onconnectionstatechange = () => {
          console.log('[casting] Peer connection state:', pc.connectionState)
          if (pc.connectionState === 'failed') {
            setStatus('error')
          }
        }

        await pc.setRemoteDescription(offerDesc)
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        await new Promise<void>((resolve) => {
          if (pc.iceGatheringState === 'complete') {
            resolve()
            return
          }
          const onGatheringStateChange = () => {
            if (pc.iceGatheringState === 'complete') {
              pc.removeEventListener(
                'icegatheringstatechange',
                onGatheringStateChange,
              )
              resolve()
            }
          }
          pc.addEventListener('icegatheringstatechange', onGatheringStateChange)
        })

        const answerDesc = pc.localDescription
        if (answerDesc) {
          emitter.casting.Answer(answerDesc)
        }
      } catch (e) {
        console.error('[casting] Error handling offer:', e)
        pcRef.current?.close()
        pcRef.current = null
        setStatus('error')
      }
    },
    [socket, emitter],
  )

  useEffect(() => {
    if (!socket) return
    const unsubscribe = subscribe(socket, CASTING_EVENT, {
      Offer: handleOffer,
    })
    return () => {
      unsubscribe()
    }
  }, [socket, handleOffer])

  const startCasting = useCallback(async () => {
    if (!socket?.connected || !emitter) {
      console.warn('[casting] Socket not connected')
      setStatus('error')
      return
    }
    setStatus('requesting')
    try {
      const payload = await getCastingIceServers()
      iceServersRef.current = payload
      emitter.casting.RequestOffer(JSON.stringify(payload))
      console.log('[casting] ICE servers:', JSON.stringify(payload))
    } catch (e) {
      console.error('[casting] Error getting casting ICE servers:', e)
      setStatus('error')
    }
  }, [socket, emitter])

  const stopCasting = useCallback(() => {
    const pc = pcRef.current
    if (pc) {
      pc.close()
      pcRef.current = null
    }
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((t) => t.stop())
      videoRef.current.srcObject = null
    }
    setStatus('idle')
    emitter?.casting.StopCasting()
    iceServersRef.current = []
  }, [emitter])

  useEffect(() => {
    return () => {
      pcRef.current?.close()
      pcRef.current = null
      emitterRef.current?.casting.StopCasting()
      iceServersRef.current = []
    }
  }, [])

  return { startCasting, stopCasting, videoRef, status }
}
