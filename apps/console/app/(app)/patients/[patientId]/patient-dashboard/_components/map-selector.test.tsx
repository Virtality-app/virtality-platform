import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import MapSelector from './map-selector'

const mocks = vi.hoisted(() => ({
  setSelectedMap: vi.fn(),
  maps: undefined as { id: string; name: string; image: null }[] | undefined,
}))

vi.mock('@/context/patient-dashboard-context', () => ({
  usePatientDashboard: () => ({
    state: { selectedMap: null, programState: 'ready' },
    handler: { setSelectedMap: mocks.setSelectedMap },
    store: null,
    patientLocalData: {},
    patientId: 'patient-1',
  }),
}))

vi.mock('@virtality/react-query', () => ({
  useMap: () => ({ data: mocks.maps }),
  usePatient: () => ({ data: undefined }),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  mocks.maps = undefined
})

// Scene Settings once froze when this selector set state while rendering
// with no map selected.
describe('MapSelector', () => {
  it('renders the placeholder without selecting while maps load', () => {
    render(<MapSelector />)

    expect(screen.getByText('Select a Map')).toBeInTheDocument()
    expect(mocks.setSelectedMap).not.toHaveBeenCalled()
  })

  it('does not pick a map on its own once maps arrive', () => {
    const { rerender } = render(<MapSelector />)
    mocks.maps = [{ id: 'map-1', name: 'Beach', image: null }]
    rerender(<MapSelector />)

    expect(screen.getByText('Select a Map')).toBeInTheDocument()
    expect(mocks.setSelectedMap).not.toHaveBeenCalled()
  })
})
