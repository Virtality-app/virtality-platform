'use client'
import { createSocket } from '@/socket'
import { VRDevice } from '@/types/models'
import { useEffect, useRef, useState } from 'react'
import { useDeviceCore } from '@virtality/react-query'
import { createDeviceEmitter } from '@/lib/device-event-controller'

export type useDeviceData = ReturnType<typeof useDevice>

function createVRDevice(data: VRDevice['data']): VRDevice {
  const socket = createSocket()
  return {
    data,
    socket,
    mutations: {
      setDeviceRoomCode: (roomCode: string) => {
        socket.io.opts.query.roomCode = roomCode
      },
      clearDeviceRoomCode: () => {
        socket.io.opts.query.roomCode = ''
      },
    },
    events: createDeviceEmitter(socket),
  }
}

/**
 * The clinician's headsets, each with one socket for as long as the hook is
 * mounted. Mounted once in the app layout, so a headset connection survives
 * page changes. A refetch keeps each device's socket; a device that
 * disappears from the list is disconnected, and so is every device on
 * unmount (sign-out leaves the app layout).
 */
const useDevice = () => {
  const {
    data: initialDevices,
    createDevice,
    removeDevice,
    isLoading,
  } = useDeviceCore()

  const [devices, setDevices] = useState<VRDevice[]>([])
  const registryRef = useRef(new Map<string, VRDevice>())

  useEffect(() => {
    const registry = registryRef.current
    const next = (initialDevices ?? []).map((data) => {
      const known = registry.get(data.id)
      if (!known) return createVRDevice(data)
      // Unchanged rows keep their object, so effects keyed on the device
      // don't re-run on every refetch.
      return known.data === data ? known : { ...known, data }
    })

    const nextIds = new Set(next.map((device) => device.data.id))
    for (const [id, device] of registry) {
      if (!nextIds.has(id)) device.socket.disconnect()
    }
    registry.clear()
    for (const device of next) registry.set(device.data.id, device)

    setDevices(next)
  }, [initialDevices])

  useEffect(() => {
    const registry = registryRef.current
    return () => {
      for (const device of registry.values()) device.socket.disconnect()
      registry.clear()
    }
  }, [])

  return {
    devices,
    isLoading,
    removeDevice,
    createDevice,
  }
}

export default useDevice
