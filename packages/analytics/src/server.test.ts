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
    const analytics = createServerAnalytics({ client, createId: () => 'evt-1' })

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
      uuid: 'evt-1',
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

  it('saves the event to the store under the uuid PostHog gets', async () => {
    const client = fakeClient()
    const store = vi.fn(async () => {})
    const analytics = createServerAnalytics({
      client,
      store,
      createId: () => 'evt-1',
    })

    analytics.capture({
      distinctId: 'user-1',
      event: 'program_created',
      properties: { program_id: 'prog-1', origin: 'scratch' },
      setOnce: { first_program_created_at: '2026-11-06T10:00:00.000Z' },
    })
    await analytics.shutdown()

    expect(store).toHaveBeenCalledWith({
      id: 'evt-1',
      event: 'program_created',
      userId: 'user-1',
      properties: { program_id: 'prog-1', origin: 'scratch' },
      source: 'server',
    })
    expect(client.capture.mock.calls[0][0].uuid).toBe('evt-1')
  })

  it('stores events without PostHog when no API key is configured', async () => {
    const store = vi.fn(async () => {})
    const analytics = createServerAnalytics({ store })

    analytics.capture({
      distinctId: 'user-1',
      event: 'headset_added',
      properties: { device_record_id: 'd-1' },
    })
    await analytics.shutdown()

    expect(store).toHaveBeenCalledOnce()
  })

  it('still sends to PostHog and reports the error when the store fails', async () => {
    const error = new Error('db down')
    const client = fakeClient()
    const onError = vi.fn()
    const analytics = createServerAnalytics({
      client,
      store: async () => {
        throw error
      },
      onError,
    })

    analytics.capture({
      distinctId: 'user-1',
      event: 'headset_removed',
      properties: { device_record_id: 'd-1' },
    })
    await analytics.shutdown()

    expect(client.capture).toHaveBeenCalledOnce()
    expect(onError).toHaveBeenCalledWith(error)
  })

  it('waits for pending store writes on shutdown', async () => {
    let finishWrite = () => {}
    const store = vi.fn(
      () => new Promise<void>((resolve) => (finishWrite = resolve)),
    )
    const client = fakeClient()
    const analytics = createServerAnalytics({ client, store })

    analytics.capture({
      distinctId: 'user-1',
      event: 'program_retired',
      properties: { program_id: 'prog-1' },
    })
    const shutdown = analytics.shutdown()
    await Promise.resolve()
    expect(client.shutdown).not.toHaveBeenCalled()

    finishWrite()
    await shutdown
    expect(client.shutdown).toHaveBeenCalledOnce()
  })
})
