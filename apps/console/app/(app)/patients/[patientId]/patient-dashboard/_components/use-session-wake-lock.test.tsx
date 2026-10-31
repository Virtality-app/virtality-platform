import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSessionWakeLock } from './use-session-wake-lock'

type FakeSentinel = { released: boolean; release: () => Promise<void> }

const sentinels: FakeSentinel[] = []
const request = vi.fn(async () => {
  const sentinel: FakeSentinel = {
    released: false,
    release: vi.fn(async () => {
      sentinel.released = true
    }),
  }
  sentinels.push(sentinel)
  return sentinel
})

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => state,
  })
}

beforeEach(() => {
  sentinels.length = 0
  request.mockClear()
  setVisibility('visible')
  Object.defineProperty(navigator, 'wakeLock', {
    configurable: true,
    value: { request },
  })
})

afterEach(() => {
  // @ts-expect-error test cleanup of the stubbed API
  delete navigator.wakeLock
})

describe('useSessionWakeLock', () => {
  it('does nothing while no session runs', () => {
    renderHook(() => useSessionWakeLock(false))
    expect(request).not.toHaveBeenCalled()
  })

  it('takes the lock when a session starts and releases it when it ends', async () => {
    const { rerender } = renderHook(
      ({ active }) => useSessionWakeLock(active),
      {
        initialProps: { active: true },
      },
    )
    await act(async () => {})
    expect(request).toHaveBeenCalledWith('screen')

    rerender({ active: false })
    expect(sentinels[0]?.release).toHaveBeenCalled()
  })

  it('takes the lock again when the page becomes visible', async () => {
    renderHook(() => useSessionWakeLock(true))
    await act(async () => {})
    expect(request).toHaveBeenCalledTimes(1)

    sentinels[0]!.released = true
    setVisibility('hidden')
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(request).toHaveBeenCalledTimes(1)

    setVisibility('visible')
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(request).toHaveBeenCalledTimes(2)
  })
})
