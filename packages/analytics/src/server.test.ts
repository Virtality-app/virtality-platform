import { describe, expect, it, vi } from 'vitest'
import { createServerAnalytics, noopServerAnalytics } from './server.ts'

const fakeClient = () => ({
  capture: vi.fn(),
  shutdown: vi.fn(async () => {}),
})

describe('createServerAnalytics', () => {
  it('returns the no-op client when no API key is configured', () => {
    expect(createServerAnalytics({})).toBe(noopServerAnalytics)
  })

  it('sends the event with person properties under $set and $set_once', () => {
    const client = fakeClient()
    const analytics = createServerAnalytics({ client })

    analytics.capture({
      distinctId: 'user-1',
      event: 'treatment_session_started',
      properties: {
        patient_session_id: 'ps-1',
        patient_id: 'p-1',
        program_source: 'quick_start',
        exercise_count: 3,
      },
      set: { last_treatment_session_at: '2026-11-06T10:00:00.000Z' },
      setOnce: { first_treatment_session_at: '2026-11-06T10:00:00.000Z' },
    })

    expect(client.capture).toHaveBeenCalledWith({
      distinctId: 'user-1',
      event: 'treatment_session_started',
      properties: {
        patient_session_id: 'ps-1',
        patient_id: 'p-1',
        program_source: 'quick_start',
        exercise_count: 3,
        $set: { last_treatment_session_at: '2026-11-06T10:00:00.000Z' },
        $set_once: { first_treatment_session_at: '2026-11-06T10:00:00.000Z' },
      },
    })
  })

  it('omits $set and $set_once when none are given', () => {
    const client = fakeClient()
    createServerAnalytics({ client }).capture({
      distinctId: 'user-1',
      event: 'program_retired',
      properties: { program_id: 'prog-1' },
    })

    expect(client.capture.mock.calls[0][0].properties).toEqual({
      program_id: 'prog-1',
    })
  })

  it('reports a failing capture instead of throwing', () => {
    const error = new Error('boom')
    const client = fakeClient()
    client.capture.mockImplementation(() => {
      throw error
    })
    const onError = vi.fn()
    const analytics = createServerAnalytics({ client, onError })

    expect(() =>
      analytics.capture({
        distinctId: 'user-1',
        event: 'headset_added',
        properties: { device_record_id: 'd-1' },
      }),
    ).not.toThrow()
    expect(onError).toHaveBeenCalledWith(error)
  })
})
