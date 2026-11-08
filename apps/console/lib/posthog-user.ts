import type posthog from 'posthog-js'
import { isInternalRole, type PersonProperties } from '@virtality/analytics'

export type PostHogIdentifiableUser = {
  id: string
  email: string
  name?: string | null
  role?: string | null
  emailVerified?: boolean
  createdAt?: Date | string
}

type PostHogClient = Pick<typeof posthog, 'identify' | 'reloadFeatureFlags'>

/** Tie PostHog person properties to the auth session and refresh flag payloads. */
export function identifyPostHogUser(
  client: PostHogClient,
  user: PostHogIdentifiableUser,
): void {
  const set: PersonProperties = {
    email: user.email,
    name: user.name ?? undefined,
    role: user.role ?? undefined,
    is_internal: isInternalRole(user.role),
    email_verified: user.emailVerified,
  }
  const setOnce: PersonProperties = {
    signup_at: user.createdAt
      ? new Date(user.createdAt).toISOString()
      : undefined,
  }

  client.identify(user.id, set, setOnce)
  // identify only reloads flags when the distinct id changes; a re-identify
  // after email verification keeps the same id but can change flag targeting.
  client.reloadFeatureFlags()
}
