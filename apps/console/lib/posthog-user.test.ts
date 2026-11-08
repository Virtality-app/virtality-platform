import { describe, expect, it, vi } from 'vitest'
import { identifyPostHogUser } from './posthog-user.ts'

describe('identifyPostHogUser', () => {
  it('identifies the user with person properties and reloads feature flags', () => {
    const identify = vi.fn()
    const reloadFeatureFlags = vi.fn()

    identifyPostHogUser(
      { identify, reloadFeatureFlags },
      {
        id: 'user-1',
        email: 'dev@virtality.app',
        name: 'Dev User',
        role: 'user',
        emailVerified: true,
        createdAt: '2026-10-01T09:00:00.000Z',
      },
    )

    expect(identify).toHaveBeenCalledWith(
      'user-1',
      {
        email: 'dev@virtality.app',
        name: 'Dev User',
        role: 'user',
        is_internal: false,
        email_verified: true,
      },
      { signup_at: '2026-10-01T09:00:00.000Z' },
    )
    expect(reloadFeatureFlags).toHaveBeenCalledOnce()
  })

  it.each([
    ['admin', true],
    // Some clinics doing real work hold the tester role.
    ['tester', false],
  ])('marks %s accounts as internal: %s', (role, internal) => {
    const identify = vi.fn()

    identifyPostHogUser(
      { identify, reloadFeatureFlags: vi.fn() },
      { id: 'user-1', email: 'someone@example.com', role },
    )

    expect(identify.mock.calls[0][1]).toMatchObject({ is_internal: internal })
  })
})
