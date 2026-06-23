import { io, type Socket } from 'socket.io-client'
import {
  CONNECTION_EVENT,
  getSocketUrl,
  type VrPresenceResponse,
} from '@virtality/shared/types'

export const VR_PRESENCE_POLL_INTERVAL_MS = 5_000

export {
  buildDevicePresenceById,
  getPairedDeviceRoomCodes,
  resolveDeviceVrPresenceStatus,
  type DeviceVrPresenceStatus,
} from './vr-presence-status'

export function createPresenceSocket(): Socket {
  return io(getSocketUrl(), {
    secure: true,
    autoConnect: false,
    query: {
      mode: 'presence',
    },
  })
}

export function queryVrPresence(
  socket: Socket,
  roomCodes: string[],
): Promise<VrPresenceResponse> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Timed out waiting for VR presence response'))
    }, 10_000)

    socket.emit(
      CONNECTION_EVENT.VR_PRESENCE,
      { roomCodes },
      (response: VrPresenceResponse) => {
        clearTimeout(timer)
        resolve(response)
      },
    )
  })
}
