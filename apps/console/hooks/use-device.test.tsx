import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import useDevice from './use-device'

const mocks = vi.hoisted(() => ({
  devices: undefined as { id: string }[] | undefined,
  sockets: [] as { disconnect: ReturnType<typeof vi.fn> }[],
}))

vi.mock('@virtality/react-query', () => ({
  useDeviceCore: () => ({
    data: mocks.devices,
    createDevice: {},
    removeDevice: {},
    isLoading: false,
  }),
}))
vi.mock('@/socket', () => ({
  createSocket: () => {
    const socket = { io: { opts: { query: {} } }, disconnect: vi.fn() }
    mocks.sockets.push(socket)
    return socket
  },
}))
vi.mock('@/lib/device-event-controller', () => ({
  createDeviceEmitter: () => ({}),
}))

const rowA = { id: 'a' }
const rowB = { id: 'b' }

beforeEach(() => {
  mocks.devices = [rowA, rowB]
  mocks.sockets = []
})
afterEach(cleanup)

describe('useDevice', () => {
  it('keeps each device, socket included, across a refetch', () => {
    const { result, rerender } = renderHook(() => useDevice())
    const [deviceA, deviceB] = result.current.devices

    mocks.devices = [rowA, { id: 'b' }]
    rerender()

    expect(result.current.devices[0]).toBe(deviceA)
    expect(result.current.devices[1]).not.toBe(deviceB)
    expect(result.current.devices[1].socket).toBe(deviceB.socket)
    expect(mocks.sockets).toHaveLength(2)
  })

  it('disconnects a device that leaves the list', () => {
    const { result, rerender } = renderHook(() => useDevice())
    const [, deviceB] = result.current.devices

    mocks.devices = [rowA]
    rerender()

    expect(deviceB.socket.disconnect).toHaveBeenCalled()
    expect(result.current.devices).toHaveLength(1)
  })

  it('disconnects every device on unmount', () => {
    const { result, unmount } = renderHook(() => useDevice())
    const sockets = result.current.devices.map((device) => device.socket)

    unmount()

    for (const socket of sockets) expect(socket.disconnect).toHaveBeenCalled()
  })
})
