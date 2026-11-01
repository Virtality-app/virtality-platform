'use client'

import { useEffect, useRef } from 'react'
import type { VRDevice } from '@/types/models'

type AutoConnectHeadsetDeps = {
  selectedDevice: VRDevice | null
  connect: () => Promise<void>
}

/**
 * Brings the patient's remembered headset online when the dashboard opens,
 * the way the Device popover does: room code first, then connect. One try
 * per selected headset per visit, so a manual Disconnect sticks and a
 * failure shows in the connection badge instead of retrying in a loop. A
 * socket this tab lost to a newer console tab stays down until the
 * clinician connects it by hand.
 */
export function useAutoConnectHeadset({
  selectedDevice,
  connect,
}: AutoConnectHeadsetDeps) {
  const triedDeviceIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!selectedDevice) return
    const { id, deviceId } = selectedDevice.data
    if (!deviceId || triedDeviceIdRef.current === id) return
    triedDeviceIdRef.current = id

    const { socket } = selectedDevice
    if (socket.connected || socket.io.opts.reconnection === false) return

    selectedDevice.mutations.setDeviceRoomCode(deviceId)
    void connect().catch(() => {})
    // `connect` is recreated every render; the try follows the headset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDevice])
}
