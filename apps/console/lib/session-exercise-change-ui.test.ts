import { describe, expect, it } from 'vitest'
import {
  EXERCISE_CHANGE_ACK_TIMEOUT_MS,
  EXERCISE_LIST_HIGHLIGHT_LABEL,
  resolveDirectSelectionBlockedTooltip,
  resolveExerciseChangeFailureMessage,
  resolveExerciseChangeStatusMessage,
  resolveExerciseListHighlightBadgeClass,
  resolveExerciseListHighlightClass,
  resolveSkipControlDisabledReason,
  resolveSkipControlTooltip,
  resolveSkipControlUiState,
} from './session-exercise-change-ui.js'
import type { PendingExerciseChange } from './session-exercise-skip.js'

const pending: PendingExerciseChange = {
  targetExerciseIndex: 2,
  sourceExerciseIndex: 0,
  sourceExerciseId: 'ex-1',
}

describe('resolveSkipControlDisabledReason', () => {
  it('reports pending when an exercise change is in flight', () => {
    expect(
      resolveSkipControlDisabledReason({
        direction: 'forward',
        currentExerciseIndex: 0,
        exerciseCount: 3,
        pendingExerciseChange: pending,
      }),
    ).toBe('pending')
  })

  it('reports boundary at the first and last exercises', () => {
    expect(
      resolveSkipControlDisabledReason({
        direction: 'back',
        currentExerciseIndex: 0,
        exerciseCount: 3,
        pendingExerciseChange: null,
      }),
    ).toBe('boundary')
    expect(
      resolveSkipControlDisabledReason({
        direction: 'forward',
        currentExerciseIndex: 2,
        exerciseCount: 3,
        pendingExerciseChange: null,
      }),
    ).toBe('boundary')
  })

  it('returns null when skip controls are available', () => {
    expect(
      resolveSkipControlDisabledReason({
        direction: 'forward',
        currentExerciseIndex: 1,
        exerciseCount: 3,
        pendingExerciseChange: null,
      }),
    ).toBeNull()
  })
})

describe('resolveSkipControlTooltip', () => {
  it('explains pending and boundary disabled states', () => {
    expect(resolveSkipControlTooltip('pending', 'forward')).toMatch(
      /headset.*confirm/i,
    )
    expect(resolveSkipControlTooltip('boundary', 'back')).toMatch(
      /first exercise/i,
    )
    expect(resolveSkipControlTooltip('boundary', 'forward')).toMatch(
      /last exercise/i,
    )
    expect(resolveSkipControlTooltip(null, 'forward')).toBeUndefined()
  })
})

describe('resolveSkipControlUiState', () => {
  it('combines disabled state, reason, and tooltip for each direction', () => {
    expect(
      resolveSkipControlUiState({
        direction: 'forward',
        currentExerciseIndex: 0,
        exerciseCount: 3,
        pendingExerciseChange: pending,
      }),
    ).toEqual({
      isDisabled: true,
      disabledReason: 'pending',
      tooltip: expect.stringMatching(/headset.*confirm/i),
    })

    expect(
      resolveSkipControlUiState({
        direction: 'back',
        currentExerciseIndex: 1,
        exerciseCount: 3,
        pendingExerciseChange: null,
      }),
    ).toEqual({
      isDisabled: false,
      disabledReason: null,
      tooltip: undefined,
    })
  })
})

describe('resolveDirectSelectionBlockedTooltip', () => {
  it('explains why direct selection is blocked during a pending change', () => {
    expect(resolveDirectSelectionBlockedTooltip(pending)).toMatch(/in flight/i)
    expect(resolveDirectSelectionBlockedTooltip(null)).toBeUndefined()
  })
})

describe('resolveExerciseChangeStatusMessage', () => {
  it('names both headset-confirmed and pending target exercises', () => {
    expect(
      resolveExerciseChangeStatusMessage({
        confirmedExerciseName: 'Shoulder Flexion',
        pendingExerciseName: 'Elbow Extension',
      }),
    ).toMatch(/Shoulder Flexion/)
    expect(
      resolveExerciseChangeStatusMessage({
        confirmedExerciseName: 'Shoulder Flexion',
        pendingExerciseName: 'Elbow Extension',
      }),
    ).toMatch(/Elbow Extension/)
    expect(
      resolveExerciseChangeStatusMessage({
        confirmedExerciseName: 'Shoulder Flexion',
        pendingExerciseName: 'Elbow Extension',
      }),
    ).toMatch(/headset-confirmed/i)
  })
})

describe('resolveExerciseChangeFailureMessage', () => {
  it('keeps the headset-confirmed exercise current after a failed change', () => {
    expect(resolveExerciseChangeFailureMessage('Shoulder Flexion')).toMatch(
      /timed out/i,
    )
    expect(resolveExerciseChangeFailureMessage('Shoulder Flexion')).toMatch(
      /Shoulder Flexion/,
    )
    expect(resolveExerciseChangeFailureMessage('Shoulder Flexion')).toMatch(
      /remains/i,
    )
  })
})

describe('resolveExerciseListHighlightClass', () => {
  it('uses distinct ring styles for confirmed and pending exercises', () => {
    expect(resolveExerciseListHighlightClass('confirmed')).toMatch(/green/)
    expect(resolveExerciseListHighlightClass('pending')).toMatch(/amber/)
    expect(resolveExerciseListHighlightClass(null)).toBe('')
  })
})

describe('resolveExerciseListHighlightBadgeClass', () => {
  it('uses distinct badge styles for confirmed and pending exercises', () => {
    expect(resolveExerciseListHighlightBadgeClass('confirmed')).toMatch(/green/)
    expect(resolveExerciseListHighlightBadgeClass('pending')).toMatch(/amber/)
  })
})

describe('exercise change UI constants', () => {
  it('exposes glossary-aligned highlight labels', () => {
    expect(EXERCISE_LIST_HIGHLIGHT_LABEL.confirmed).toMatch(/headset/i)
    expect(EXERCISE_LIST_HIGHLIGHT_LABEL.pending).toMatch(/pending/i)
  })

  it('uses a bounded acknowledgement timeout', () => {
    expect(EXERCISE_CHANGE_ACK_TIMEOUT_MS).toBeGreaterThan(0)
  })
})
