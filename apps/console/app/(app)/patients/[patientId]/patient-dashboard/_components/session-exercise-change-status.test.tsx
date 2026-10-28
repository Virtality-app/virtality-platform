import { cleanup, render, screen } from '@testing-library/react'
import type { Exercise } from '@virtality/db'
import { afterEach, describe, expect, it } from 'vitest'
import type { CompleteExercise } from '@/types/models'
import SessionExerciseChangeStatus from './session-exercise-change-status'

afterEach(cleanup)

const exercises = [
  { exerciseId: 'press-left' },
  { exerciseId: 'curl-right' },
] as unknown as CompleteExercise[]

const defaultExercises = [
  { id: 'press-left', displayName: 'Press', direction: 'Left' },
  { id: 'curl-right', displayName: 'Curl', direction: 'Right' },
] as unknown as Exercise[]

function change(targetExerciseIndex: number) {
  return {
    sourceExerciseIndex: 0,
    sourceExerciseId: 'press-left',
    targetExerciseIndex,
  }
}

describe('SessionExerciseChangeStatus', () => {
  it('announces the headset-confirmed and pending exercises', () => {
    render(
      <SessionExerciseChangeStatus
        pendingExerciseChange={change(1)}
        exercises={exercises}
        defaultExercises={defaultExercises}
      />,
    )

    const message = screen.getByText(
      /Waiting for headset to confirm change from Press Left to Curl Right/,
    )
    expect(message.closest('[aria-live="polite"]')).toBeInTheDocument()
  })

  it('falls back to generic names before the catalog loads', () => {
    render(
      <SessionExerciseChangeStatus
        pendingExerciseChange={change(1)}
        exercises={exercises}
      />,
    )

    expect(
      screen.getByText(/from Current exercise to Pending exercise/),
    ).toBeInTheDocument()
  })

  it('renders nothing when an exercise index is out of range', () => {
    const { container } = render(
      <SessionExerciseChangeStatus
        pendingExerciseChange={change(5)}
        exercises={exercises}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
