import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { INVALID_APPROVAL_LINK_MESSAGE } from '@virtality/shared/utils'
import PasswordSetupConfirmForm from './confirm-form'

type ApproveOptions = {
  onSuccess: () => Promise<void>
  onError: () => void
}

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  inspect: vi.fn(),
  approve: vi.fn(),
  invalidateQueries: vi.fn(),
  session: null as { user: { id: string } } | null,
  inspectState: {
    data: undefined as
      | { valid: true; kind: 'SETUP' | 'CHANGE' }
      | { valid: false; canReturnToProfile: boolean }
      | undefined,
    isPending: false,
  },
  approveOptions: null as ApproveOptions | null,
}))

vi.mock('@/i18n/use-client-t', async () =>
  (await import('@/i18n/test-t')).useClientTMock(),
)

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
}))

vi.mock('@/auth-client', () => ({
  authClient: { useSession: () => ({ data: mocks.session }) },
}))

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: mocks.invalidateQueries }),
}))

vi.mock('@virtality/react-query', () => ({
  useORPC: () => ({
    user: { hasPassword: { key: () => ['user', 'hasPassword'] } },
    pendingPasswordChange: {
      getActive: { key: () => ['pendingPasswordChange', 'getActive'] },
    },
  }),
  useInspectPendingPasswordChange: () => ({
    mutate: mocks.inspect,
    ...mocks.inspectState,
  }),
  useApprovePendingPasswordChange: (options: ApproveOptions) => {
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

describe('PasswordSetupConfirmForm', () => {
  it('inspects the token on load without approving', () => {
    mocks.inspectState.isPending = true
    render(<PasswordSetupConfirmForm token='token-1' />)

    expect(mocks.inspect).toHaveBeenCalledExactlyOnceWith({ token: 'token-1' })
    expect(mocks.approve).not.toHaveBeenCalled()
    expect(screen.getByText('Checking approval link')).toBeInTheDocument()
  })

  it('shows generic invalid link copy and sends the matching user back to their profile', () => {
    mocks.inspectState.data = { valid: false, canReturnToProfile: true }
    render(<PasswordSetupConfirmForm token='token-1' />)

    expect(screen.getByText(INVALID_APPROVAL_LINK_MESSAGE)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Back to profile' }),
    ).toHaveAttribute('href', '/user/user-1/profile')
  })

  it('offers sign-in when the link is missing', () => {
    render(<PasswordSetupConfirmForm />)

    expect(screen.getByText('Invalid link')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/sign-in',
    )
  })

  it.each([
    ['SETUP', 'Approve password setup'],
    ['CHANGE', 'Approve password change'],
  ] as const)(
    'asks for explicit approval of a pending %s request',
    (kind, title) => {
      mocks.inspectState.data = { valid: true, kind }
      render(<PasswordSetupConfirmForm token='token-1' />)

      expect(screen.getByText(title)).toBeInTheDocument()
      expect(
        screen.getByText(/Opening this page did not change your account/),
      ).toBeInTheDocument()
      expect(mocks.approve).not.toHaveBeenCalled()
    },
  )

  it('refreshes password state and confirms success after approval', async () => {
    mocks.inspectState.data = { valid: true, kind: 'CHANGE' }
    mocks.approve.mockImplementation(() => mocks.approveOptions?.onSuccess())
    render(<PasswordSetupConfirmForm token='token-1' />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Approve' }))
    })

    expect(mocks.approve).toHaveBeenCalledExactlyOnceWith({ token: 'token-1' })
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['user', 'hasPassword'],
    })
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['pendingPasswordChange', 'getActive'],
    })
    expect(screen.getByText('Password changed')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Back to profile' }))

    expect(mocks.push).toHaveBeenCalledExactlyOnceWith('/user/user-1/profile')
  })

  it('shows the invalid link message when approval fails', () => {
    mocks.inspectState.data = { valid: true, kind: 'SETUP' }
    mocks.approve.mockImplementation(() => mocks.approveOptions?.onError())
    render(<PasswordSetupConfirmForm token='token-1' />)

    fireEvent.click(screen.getByRole('button', { name: 'Approve' }))

    expect(screen.getByText(INVALID_APPROVAL_LINK_MESSAGE)).toBeInTheDocument()
    expect(screen.queryByText('Password set')).not.toBeInTheDocument()
  })
})
