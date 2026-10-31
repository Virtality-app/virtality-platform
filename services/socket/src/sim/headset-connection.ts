import { io } from 'socket.io-client'
import { CONNECTION_EVENT, ROOM_PEER_ROLE } from '@virtality/shared/types'
import { createSimulatedHeadset, type Emit } from './simulated-headset'

const TICK_MS = 100

export type HeadsetConnectionOptions = {
  socketUrl: string
  roomCode: string
  ignoreVideoStop: boolean
}

/** Joins `roomCode` as the `vr` peer and answers events with a Simulated Headset. */
export function connectSimulatedHeadset({
  socketUrl,
  roomCode,
  ignoreVideoStop,
}: HeadsetConnectionOptions) {
  const tag = `[sim ${roomCode}]`
  const socket = io(socketUrl, {
    query: { roomCode, role: ROOM_PEER_ROLE.Vr },
  })
  const headset = createSimulatedHeadset({ ignoreVideoStop })

  function send(emits: Emit[]) {
    for (const { event, payload } of emits) {
      console.log(`${tag} → ${event}`, payload ?? '')
      if (payload === undefined) socket.emit(event)
      else socket.emit(event, payload)
    }
  }

  socket.on('connect', () => {
    console.log(
      `${tag} connected as ${socket.id} to ${socketUrl}, room ${roomCode}`,
    )
  })
  socket.on(CONNECTION_EVENT.DISCONNECTION, (reason) => {
    console.log(`${tag} disconnected: ${reason}`)
  })
  socket.on(CONNECTION_EVENT.ERROR, (error) => {
    console.error(`${tag} server rejected the connection:`, error)
  })

  socket.onAny((event: string, payload?: unknown) => {
    console.log(`${tag} ← ${event}`, payload ?? '')
    send(headset.handle(event, payload))
  })

  const ticker = setInterval(() => send(headset.tick(Date.now())), TICK_MS)

  return {
    close() {
      clearInterval(ticker)
      socket.close()
    },
  }
}
