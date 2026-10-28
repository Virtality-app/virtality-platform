import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { INVALID_APPROVAL_LINK_MESSAGE } from '@virtality/shared/utils'
import DeleteAccountConfirmForm from './confirm-form'

type ApproveOptions = {
  onSuccess: () => Promise<void>
  onError: () => void
}

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  signOut: vi.fn(),
  inspect: vi.fn(),
  approve: vi.fn(),
  session: null as { user: { id: string } } | null,
  inspectState: {
    data: undefined as
      | { valid: true }
      | { valid: false; canReturnToProfile: boolean }
      | undefined,
    isPending: false,
  },
  approveOptions: null as ApproveOptions | null,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
}))

vi.mock('@/auth-client', () => ({
  authClient: {
    useSession: () => ({ data: mocks.session }),
    signOut: mocks.signOut,
  },
}))

vi.mock('@virtality/react-query', () => ({
  useInspectPendingAccountDeletion: () => ({
    mutate: mocks.inspect,
    ...mocks.inspectState,
  }),
  useApprovePendingAccountDeletion: (options: ApproveOptions) => {
    mocks.approveOptions = options
    return { mutate: mocks.approve, isPending: false }
  },
}))

beforeEach(() => {
  mocks.session = { user: { id: 'user-1' } }
  mocks.inspectState.data = undefined
  mocks.inspectState.isPending = false
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('DeleteAccountConfirmForm', () => {
  it('inspects the token on load without approving', () => {
    mocks.inspectState.isPending = true
    render(<DeleteAccountConfirmForm token='token-1' />)

    expect(mocks.inspect).toHaveBeenCalledExactlyOnceWith({ token: 'token-1' })
    expect(mocks.approve).not.toHaveBeenCalled()
    expect(screen.getByText('Checking approval link')).toBeInTheDocument()
  })

  it('shows the invalid link card with sign-in when there is no token', () => {
    render(<DeleteAccountConfirmForm />)

    expect(mocks.inspect).not.toHaveBeenCalled()
    expect(screen.getByText('Invalid link')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/sign-in',
    )
  })

  it('sends the matching signed-in user back to their profile from an invalid link', () => {
    mocks.inspectState.data = { valid: false, canReturnToProfile: true }
    render(<DeleteAccountConfirmForm token='token-1' />)

    expect(screen.getByText(INVALID_APPROVAL_LINK_MESSAGE)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Back to profile' }),
    ).toHaveAttribute('href', '/user/user-1/profile')
  })

  it('offers sign-in from an invalid link the user cannot return from', () => {
    mocks.inspectState.data = { valid: false, canReturnToProfile: false }
    render(<DeleteAccountConfirmForm token='token-1' />)

    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('deletes the account only after the user approves, then signs out', async () => {
    mocks.inspectState.data = { valid: true }
    mocks.approve.mockImplementation(() => mocks.approveOptions?.onSuccess())
    render(<DeleteAccountConfirmForm token='token-1' />)

    expect(
      screen.getByText(/Opening this page did not delete your account/),
    ).toBeInTheDocument()
    expect(mocks.approve).not.toHaveBeenCalled()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Delete account' }))
    })

    expect(mocks.approve).toHaveBeenCalledExactlyOnceWith({ token: 'token-1' })
    expect(mocks.signOut).toHaveBeenCalledOnce()
    expect(mocks.push).toHaveBeenCalledExactlyOnceWith('/goodbye')
  })

  it('shows the invalid link message when approval fails', () => {
    mocks.inspectState.data = { valid: true }
    mocks.approve.mockImplementation(() => mocks.approveOptions?.onError())
    render(<DeleteAccountConfirmForm token='token-1' />)

    fireEvent.click(screen.getByRole('button', { name: 'Delete account' }))

    expect(screen.getByText(INVALID_APPROVAL_LINK_MESSAGE)).toBeInTheDocument()
    expect(mocks.push).not.toHaveBeenCalled()
  })
})
