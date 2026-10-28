import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ActivePendingPasswordChange } from '@virtality/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PendingPasswordState } from './profile-pending-password-state'

const mocks = vi.hoisted(() => ({
  resend: vi.fn(),
  cancel: vi.fn(),
}))

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}))

vi.mock('./profile-info-form', () => ({
  invalidateActivePendingPasswordChange: vi.fn(),
}))

vi.mock('@virtality/react-query', () => ({
  useORPC: () => ({}),
  useResendPendingPasswordChange: () => ({
    mutate: mocks.resend,
    isPending: false,
  }),
  useCancelPendingPasswordChange: () => ({
    mutate: mocks.cancel,
    isPending: false,
  }),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function pending(kind: 'SETUP' | 'CHANGE') {
  return {
    kind,
    destinationEmail: 'clinician@example.com',
    expiresAt: new Date('2026-10-28T12:00:00Z'),
  } as unknown as ActivePendingPasswordChange
}

describe('PendingPasswordState', () => {
  it.each([
    ['SETUP', 'Password setup is pending approval.'],
    ['CHANGE', 'Password change is pending approval.'],
  ] as const)('names a pending %s request', (kind, copy) => {
    render(<PendingPasswordState pending={pending(kind)} />)

    expect(screen.getByText(copy, { exact: false })).toBeInTheDocument()
  })

  it('shows where the approval email went and when the link expires', () => {
    render(<PendingPasswordState pending={pending('CHANGE')} />)

    expect(screen.getByText('clinician@example.com')).toBeInTheDocument()
    expect(
      screen.getByText(
        `The approval link expires at ${new Date('2026-10-28T12:00:00Z').toLocaleString()}.`,
      ),
    ).toBeInTheDocument()
  })

  it('resends or cancels the pending request', () => {
    render(<PendingPasswordState pending={pending('SETUP')} />)

    fireEvent.click(screen.getByRole('button', { name: 'Resend email' }))
    expect(mocks.resend).toHaveBeenCalledOnce()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel request' }))
    expect(mocks.cancel).toHaveBeenCalledOnce()
  })
})
