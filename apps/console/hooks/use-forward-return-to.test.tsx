import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useForwardReturnTo } from './use-forward-return-to'

const mocks = vi.hoisted(() => ({ search: new URLSearchParams() }))

vi.mock('next/navigation', () => ({
  useSearchParams: () => mocks.search,
}))

afterEach(() => {
  cleanup()
  mocks.search = new URLSearchParams()
})

describe('useForwardReturnTo', () => {
  it('keeps the link as it is without a returnTo', () => {
    const { result } = renderHook(() => useForwardReturnTo('/patients/new'))
    expect(result.current).toBe('/patients/new')
  })

  it('carries the page returnTo on to the create page', () => {
    mocks.search = new URLSearchParams({ returnTo: '/?device=d1' })
    const { result } = renderHook(() => useForwardReturnTo('/patients/new'))
    expect(result.current).toBe('/patients/new?returnTo=%2F%3Fdevice%3Dd1')
  })
})
