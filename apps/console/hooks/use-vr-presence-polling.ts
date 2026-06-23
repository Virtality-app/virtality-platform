'use client'

import { useEffect, useRef, useState } from 'react'
import type { Device } from '@virtality/db'
import {
  buildDevicePresenceById,
  createPresenceSocket,
  getPairedDeviceRoomCodes,
  queryVrPresence,
  VR_PRESENCE_POLL_INTERVAL_MS,
  type DeviceVrPresenceStatus,
} from '@/lib/vr-presence'

type UseVrPresencePollingOptions = {
  enabled: boolean
  devices: Pick<Device, 'id' | 'deviceId'>[]
}

export function useVrPresencePolling({
  enabled,
  devices,
}: UseVrPresencePollingOptions): Record<string, DeviceVrPresenceStatus> {
  const [presenceByRoomCode, setPresenceByRoomCode] = useState<
    Record<string, boolean>
  >({})
  const [hasPolled, setHasPolled] = useState(false)
  const devicesRef = useRef(devices)

  useEffect(() => {
    devicesRef.current = devices
  }, [devices])

  useEffect(() => {
    if (!enabled) {
      setPresenceByRoomCode({})
      setHasPolled(false)
      return
    }

    const socket = createPresenceSocket()
    let cancelled = false
    let intervalId: ReturnType<typeof setInterval> | undefined

    const pollPresence = async () => {
      const roomCodes = getPairedDeviceRoomCodes(devicesRef.current)
      if (roomCodes.length === 0) {
        if (!cancelled) {
          setPresenceByRoomCode({})
          setHasPolled(true)
        }
        return
      }

      try {
        if (!socket.connected) {
          await new Promise<void>((resolve, reject) => {
            const onConnect = () => {
              cleanup()
              resolve()
            }
            const onConnectError = (error: Error) => {
              cleanup()
              reject(error)
            }
            const cleanup = () => {
              socket.off('connect', onConnect)
              socket.off('connect_error', onConnectError)
            }

            socket.on('connect', onConnect)
            socket.on('connect_error', onConnectError)
            socket.connect()
          })
        }

        const response = await queryVrPresence(socket, roomCodes)
        if (!cancelled) {
          setPresenceByRoomCode(response.presence)
          setHasPolled(true)
        }
      } catch {
        if (!cancelled) {
          setHasPolled(true)
        }
      }
    }

    void pollPresence()
    intervalId = setInterval(() => {
      void pollPresence()
    }, VR_PRESENCE_POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      if (intervalId) {
        clearInterval(intervalId)
      }
      socket.disconnect()
    }
  }, [enabled])

  return buildDevicePresenceById(devices, presenceByRoomCode, hasPolled)
}
