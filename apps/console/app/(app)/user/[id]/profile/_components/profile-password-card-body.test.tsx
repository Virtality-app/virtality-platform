import { cleanup, render, screen } from '@testing-library/react'
import type { ActivePendingPasswordChange } from '@virtality/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PasswordCardBody } from './profile-password-card-body'

vi.mock('./profile-password-field', () => ({
  PasswordField: () => <div>Change password form</div>,
}))
vi.mock('./profile-set-password-field', () => ({
  SetPasswordField: () => <div>Set password form</div>,
}))
vi.mock('./profile-pending-password-state', () => ({
  PendingPasswordState: ({ pending }: { pending: { kind: string } }) => (
    <div>Pending {pending.kind}</div>
  ),
}))

afterEach(cleanup)

const pending = {
  kind: 'CHANGE',
  destinationEmail: 'clinician@example.com',
  expiresAt: new Date('2026-10-28T12:00:00Z'),
} as unknown as ActivePendingPasswordChange

describe('PasswordCardBody', () => {
  it('shows a skeleton while password state is loading', () => {
    const { container } = render(
      <PasswordCardBody
        isLoading
        hasPassword={undefined}
        activePendingPasswordChange={undefined}
      />,
    )

    expect(
      container.querySelector('[data-slot="skeleton"]'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/password form/)).not.toBeInTheDocument()
  })

  it('shows a pending request ahead of either password form', () => {
    render(
      <PasswordCardBody
        isLoading={false}
        hasPassword
        activePendingPasswordChange={pending}
      />,
    )

    expect(screen.getByText('Pending CHANGE')).toBeInTheDocument()
    expect(screen.queryByText(/password form/)).not.toBeInTheDocument()
  })

  it('shows the change form when the user has a password', () => {
    render(
      <PasswordCardBody
        isLoading={false}
        hasPassword
        activePendingPasswordChange={null}
      />,
    )

    expect(screen.getByText('Change password form')).toBeInTheDocument()
  })

  it('shows the first-time setup form when the user has no password', () => {
    render(
      <PasswordCardBody
        isLoading={false}
        hasPassword={false}
        activePendingPasswordChange={null}
      />,
    )

    expect(screen.getByText('Set password form')).toBeInTheDocument()
  })
})
