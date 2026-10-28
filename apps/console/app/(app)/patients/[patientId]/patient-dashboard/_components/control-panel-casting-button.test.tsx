import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { SetStateAction } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import CastingButton from './control-panel-casting-button'

const mocks = vi.hoisted(() => ({
  flag: undefined as { enabled: boolean; payload: unknown } | undefined,
}))

vi.mock('posthog-js/react', () => ({
  useFeatureFlagResult: () => mocks.flag,
}))

afterEach(() => {
  cleanup()
  mocks.flag = undefined
})

describe('CastingButton', () => {
  it.each([false, true])(
    'only toggles the casting panel when showCasting is %s',
    (showCasting) => {
      const setShowCasting = vi.fn()
      render(
        <CastingButton
          showCasting={showCasting}
          setShowCasting={setShowCasting}
        />,
      )

      fireEvent.click(screen.getByRole('button', { name: 'Cast' }))

      expect(setShowCasting).toHaveBeenCalledOnce()
      const update = setShowCasting.mock.calls[0]![0] as SetStateAction<boolean>
      expect(typeof update === 'function' && update(showCasting)).toBe(
        !showCasting,
      )
    },
  )

  it('is hidden when the cast feature flag turns casting off', () => {
    mocks.flag = { enabled: true, payload: false }
    render(<CastingButton showCasting={false} setShowCasting={vi.fn()} />)

    expect(screen.queryByRole('button', { name: 'Cast' })).toBeNull()
  })
})
