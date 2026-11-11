import { beforeEach, describe, expect, it, vi } from 'vitest'

const capture = vi.fn()
const track = vi.fn(async () => {})
const getORPC = vi.fn(() => ({ productEvent: { track: { call: track } } }))

vi.mock('posthog-js', () => ({ default: { capture } }))
vi.mock('@virtality/react-query', () => ({ getORPC: () => getORPC() }))

const { trackAnalyticsEvent } = await import('./analytics-contract')

describe('trackAnalyticsEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('saves the event to our database under the uuid PostHog gave it', () => {
    capture.mockReturnValue({
      uuid: 'evt-1',
      properties: { $session_id: 'ph-session-1' },
    })

    trackAnalyticsEvent('patient_tab_viewed', { tab: 'sessions' })

    expect(capture).toHaveBeenCalledWith('patient_tab_viewed', {
      tab: 'sessions',
    })
    expect(track).toHaveBeenCalledWith({
      id: 'evt-1',
      event: 'patient_tab_viewed',
      properties: { tab: 'sessions' },
      sessionId: 'ph-session-1',
    })
  })

  it('still saves the event under its own uuid when PostHog drops it', () => {
    capture.mockReturnValue(undefined)

    trackAnalyticsEvent('warmup_started', {})

    expect(track).toHaveBeenCalledWith({
      id: expect.stringMatching(/^[0-9a-f-]{36}$/),
      event: 'warmup_started',
      properties: {},
      sessionId: undefined,
    })
  })

  it('does not throw when the oRPC client is not set up yet', () => {
    capture.mockReturnValue({ uuid: 'evt-1', properties: {} })
    getORPC.mockImplementationOnce(() => {
      throw new Error('ORPC not available')
    })

    expect(() => trackAnalyticsEvent('warmup_started', {})).not.toThrow()
  })

  it('swallows a failed request', async () => {
    capture.mockReturnValue({ uuid: 'evt-1', properties: {} })
    track.mockRejectedValueOnce(new Error('offline'))

    trackAnalyticsEvent('warmup_started', {})
    await Promise.resolve()

    expect(track).toHaveBeenCalledOnce()
  })
})
