import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import SessionRunningTransport from './session-running-transport'

afterEach(cleanup)

function renderTransport(
  overrides: Partial<Parameters<typeof SessionRunningTransport>[0]> = {},
) {
  const props = {
    phase: 'started' as const,
    onPauseToggle: vi.fn(),
    onEnd: vi.fn(),
    onSkip: vi.fn(),
    isBackSkipDisabled: false,
    isForwardSkipDisabled: false,
    ...overrides,
  }
  render(<SessionRunningTransport {...props} />)
  return props
}

describe('SessionRunningTransport', () => {
  it('labels every control', () => {
    renderTransport()
    expect(screen.getByRole('button', { name: 'Pause' })).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'Skip to next exercise' }),
    ).toBeTruthy()
    expect(screen.getByRole('button', { name: 'End session' })).toBeTruthy()
  })

  it('offers Resume while paused', () => {
    const { onPauseToggle } = renderTransport({ phase: 'paused' })
    act(() => screen.getByRole('button', { name: 'Resume' }).click())
    expect(onPauseToggle).toHaveBeenCalledOnce()
  })

  it('asks before ending the session', async () => {
    const { onEnd } = renderTransport()

    act(() => screen.getByRole('button', { name: 'End session' }).click())
    const dialog = await screen.findByRole('dialog')
    expect(onEnd).not.toHaveBeenCalled()

    act(() => {
      dialog
        .querySelectorAll('button')
        .forEach((button) =>
          button.textContent === 'End session' ? button.click() : null,
        )
    })
    expect(onEnd).toHaveBeenCalledOnce()
  })

  it('keeps going when the confirmation is dismissed', async () => {
    const { onEnd } = renderTransport()

    act(() => screen.getByRole('button', { name: 'End session' }).click())
    await screen.findByRole('dialog')
    act(() => screen.getByRole('button', { name: 'Keep going' }).click())

    expect(onEnd).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('blocks skipping while the session is paused', () => {
    renderTransport({ phase: 'paused' })
    const next = screen.getByRole('button', {
      name: 'Skip to next exercise',
    }) as HTMLButtonElement
    expect(next.disabled).toBe(true)
  })
})
