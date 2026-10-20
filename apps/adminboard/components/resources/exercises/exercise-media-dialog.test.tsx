import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { Exercise } from '@virtality/db'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockMutateAsync = vi.fn()

vi.mock('@virtality/react-query', () => ({
  useUpdateExerciseFamilyMedia: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/components/exercise-wizard/exercise-wizard-media-step', () => ({
  ExerciseWizardMediaStep: ({
    onChange,
  }: {
    onChange: (patch: { image?: string | null }) => void
  }) => (
    <button
      type='button'
      onClick={() => onChange({ image: 'https://cdn/new-thumb.png' })}
    >
      pick thumbnail
    </button>
  ),
}))

import { ExerciseMediaDialog } from './exercise-media-dialog'

const exercise = {
  id: '151',
  name: 'ExternalRotationTowelStretch_L',
  displayName: 'External Rotation Rope Stretch',
  image: null,
  video: 'https://cdn/video.mp4',
} as Exercise

describe('ExerciseMediaDialog', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockMutateAsync.mockResolvedValue({ updated: 2 })
  })

  it('keeps Save disabled until media changes', () => {
    render(<ExerciseMediaDialog exercise={exercise} onClose={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Save media' })).toBeDisabled()
  })

  it('saves the new media to the whole family and closes', async () => {
    const onClose = vi.fn()
    render(<ExerciseMediaDialog exercise={exercise} onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: 'pick thumbnail' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save media' }))

    await vi.waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(mockMutateAsync).toHaveBeenCalledWith({
      displayName: 'External Rotation Rope Stretch',
      image: 'https://cdn/new-thumb.png',
      video: 'https://cdn/video.mp4',
    })
  })
})
