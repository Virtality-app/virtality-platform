import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { VRDevice } from '@/types/models'
import { useAutoConnectHeadset } from './use-auto-connect-headset'

afterEach(cleanup)

function fakeDevice({
  id = 'device-1',
  deviceId = 'headset-1' as string | null,
  connected = false,
  replaced = false,
} = {}) {
  const setDeviceRoomCode = vi.fn()
  const device = {
    data: { id, deviceId },
    socket: {
      connected,
      io: { opts: { reconnection: !replaced } },
    },
    mutations: { setDeviceRoomCode, clearDeviceRoomCode: vi.fn() },
  } as unknown as VRDevice
  return { device, setDeviceRoomCode }
}

describe('useAutoConnectHeadset', () => {
  it('sets the room code and connects the remembered headset', () => {
    const { device, setDeviceRoomCode } = fakeDevice()
    const connect = vi.fn().mockResolvedValue(undefined)

    renderHook(() => useAutoConnectHeadset({ selectedDevice: device, connect }))

    expect(setDeviceRoomCode).toHaveBeenCalledWith('headset-1')
    expect(connect).toHaveBeenCalledTimes(1)
  })

  it('tries once per headset, so a manual disconnect sticks', () => {
    const { device } = fakeDevice()
    const connect = vi.fn().mockResolvedValue(undefined)

    const { rerender } = renderHook(
      ({ selectedDevice }) =>
        useAutoConnectHeadset({ selectedDevice, connect }),
      { initialProps: { selectedDevice: device } },
    )
    rerender({ selectedDevice: { ...device } })

    expect(connect).toHaveBeenCalledTimes(1)
  })

  it('tries again when a different headset is selected', () => {
    const first = fakeDevice().device
    const second = fakeDevice({ id: 'device-2', deviceId: 'headset-2' })
    const connect = vi.fn().mockResolvedValue(undefined)

    const { rerender } = renderHook(
      ({ selectedDevice }) =>
        useAutoConnectHeadset({ selectedDevice, connect }),
      { initialProps: { selectedDevice: first } },
    )
    rerender({ selectedDevice: second.device })

    expect(second.setDeviceRoomCode).toHaveBeenCalledWith('headset-2')
    expect(connect).toHaveBeenCalledTimes(2)
  })

  it.each([
    ['already connected', { connected: true }],
    ['not paired', { deviceId: null }],
    ['replaced by a newer tab', { replaced: true }],
  ])('leaves the socket alone when %s', (_, options) => {
    const { device } = fakeDevice(options)
    const connect = vi.fn().mockResolvedValue(undefined)

    renderHook(() => useAutoConnectHeadset({ selectedDevice: device, connect }))

    expect(connect).not.toHaveBeenCalled()
  })
})
