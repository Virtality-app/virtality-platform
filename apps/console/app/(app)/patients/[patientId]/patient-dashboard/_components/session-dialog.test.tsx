import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SessionCompletionSaveChoice } from '@virtality/shared/utils'
import SessionDialog from './session-dialog'

const finish = vi.fn()
const discard = vi.fn()

vi.mock('./use-session-completion', () => ({
  useSessionCompletion: () => ({
    isDialogOpen: true,
    session: null,
    summary: {
      durationMinutes: 12,
      exercisesWithProgress: 2,
      exercisesPlanned: 3,
      repsRecorded: 40,
    },
    form: {},
    completionState: {
      saveChoice: SessionCompletionSaveChoice.FINISH_ONLY,
      newProgramName: '',
      showUpdateConfirmation: false,
    },
    setCompletionState: vi.fn(),
    showUpdateSourceProgram: false,
    isCompleting: false,
    finish,
    discard,
  }),
}))

beforeEach(() => {
  finish.mockClear()
  discard.mockClear()
})

afterEach(cleanup)

const openDiscardStep = () =>
  act(() =>
    screen.getByRole('button', { name: 'Discard session record' }).click(),
  )

describe('SessionDialog discard step', () => {
  it('swaps the dialog in place instead of stacking a second one', () => {
    render(<SessionDialog />)
    openDiscardStep()

    expect(screen.getAllByRole('dialog')).toHaveLength(1)
    expect(screen.getByText('Discard this session record?')).toBeTruthy()
    expect(screen.queryByText('Session Completed')).toBeNull()
  })

  it('returns to the summary on Keep record', () => {
    render(<SessionDialog />)
    openDiscardStep()

    act(() => screen.getByRole('button', { name: 'Keep record' }).click())

    expect(screen.getByText('Session Completed')).toBeTruthy()
    expect(screen.getByText('40')).toBeTruthy()
    expect(discard).not.toHaveBeenCalled()
  })

  it('discards only after Discard record', () => {
    render(<SessionDialog />)
    openDiscardStep()

    act(() => screen.getByRole('button', { name: 'Discard record' }).click())

    expect(discard).toHaveBeenCalledOnce()
    expect(finish).not.toHaveBeenCalled()
  })

  it('backs out of the discard step on Escape without finishing', () => {
    render(<SessionDialog />)
    openDiscardStep()

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })

    expect(screen.getByText('Session Completed')).toBeTruthy()
    expect(finish).not.toHaveBeenCalled()
  })

  it('finishes the session on Escape from the summary', () => {
    render(<SessionDialog />)

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })

    expect(finish).toHaveBeenCalledOnce()
  })
})
