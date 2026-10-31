import { describe, expect, it, vi } from 'vitest'
import {
  createPairingWatcher,
  createSimDeviceId,
  SIM_DEVICE_ID_PREFIX,
  type ClaimResult,
  type PendingPairing,
} from './pairing-watcher'

function setup(claimResult: ClaimResult = { ok: true }) {
  let pending: PendingPairing[] = []
  let nextId = 0
  const claim = vi.fn(async () => claimResult)
  const onPaired = vi.fn()
  const watcher = createPairingWatcher({
    findPendingPairings: async () => pending,
    claim,
    onPaired,
    log: () => {},
    wait: async () => {},
    createDeviceId: () => `sim-${++nextId}`,
  })
  return {
    watcher,
    claim,
    onPaired,
    setPending: (next: PendingPairing[]) => {
      pending = next
    },
  }
}

describe('pairing watcher', () => {
  it('claims a pending attempt and joins as the new headset', async () => {
    const { watcher, claim, onPaired, setPending } = setup()
    setPending([{ id: 'a1', code: '123456' }])

    await watcher.poll()

    expect(claim).toHaveBeenCalledWith('123456', 'sim-1')
    expect(onPaired).toHaveBeenCalledWith('sim-1')
  })

  it('claims each attempt once across polls', async () => {
    const { watcher, claim, setPending } = setup()
    setPending([{ id: 'a1', code: '123456' }])

    await watcher.poll()
    await watcher.poll()
    setPending([
      { id: 'a1', code: '123456' },
      { id: 'a2', code: '654321' },
    ])
    await watcher.poll()

    expect(claim.mock.calls).toEqual([
      ['123456', 'sim-1'],
      ['654321', 'sim-2'],
    ])
  })

  it('does not join when the claim is refused', async () => {
    const { watcher, onPaired, setPending } = setup({
      ok: false,
      reason: '404',
    })
    setPending([{ id: 'a1', code: '123456' }])

    await watcher.poll()

    expect(onPaired).not.toHaveBeenCalled()
  })
})

describe('createSimDeviceId', () => {
  it('makes distinct, recognisable headset ids', () => {
    const a = createSimDeviceId()
    const b = createSimDeviceId()
    expect(a.startsWith(SIM_DEVICE_ID_PREFIX)).toBe(true)
    expect(a).not.toBe(b)
  })
})
