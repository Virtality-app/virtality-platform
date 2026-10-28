import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AvatarSelector from './avatar-selector'

const mocks = vi.hoisted(() => ({
  setSelectedAvatar: vi.fn(),
  avatars: undefined as { id: string; name: string; image: null }[] | undefined,
}))

vi.mock('@/context/patient-dashboard-context', () => ({
  usePatientDashboard: () => ({
    state: { selectedAvatar: null, programState: 'ready' },
    handler: { setSelectedAvatar: mocks.setSelectedAvatar },
    store: null,
    patientLocalData: {},
    patientId: 'patient-1',
  }),
}))

vi.mock('@virtality/react-query', () => ({
  useAvatar: () => ({ data: mocks.avatars }),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  mocks.avatars = undefined
})

// Scene Settings once froze when this selector set state while rendering
// with no avatar selected.
describe('AvatarSelector', () => {
  it('renders the placeholder without selecting while avatars load', () => {
    render(<AvatarSelector />)

    expect(screen.getByText('Select an Avatar')).toBeInTheDocument()
    expect(mocks.setSelectedAvatar).not.toHaveBeenCalled()
  })

  it('does not pick an avatar on its own once avatars arrive', () => {
    const { rerender } = render(<AvatarSelector />)
    mocks.avatars = [{ id: 'avatar-1', name: 'Alex', image: null }]
    rerender(<AvatarSelector />)

    expect(screen.getByText('Select an Avatar')).toBeInTheDocument()
    expect(mocks.setSelectedAvatar).not.toHaveBeenCalled()
  })
})
