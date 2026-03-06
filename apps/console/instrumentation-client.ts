import posthog from 'posthog-js'
import { authClient } from './auth-client'

if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  throw new Error('POSTHOG_KEY is not set')
}

const { data } = await authClient.getSession()

if (data) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: '/ph',
    ui_host: 'https://eu.posthog.com',
    persistence: 'localStorage+cookie',
    cookieless_mode: 'on_reject',

    loaded: async (posthog) => {
      try {
        if (data) {
          posthog.identify(data.user.id, {
            email: data.user.email,
            name: data.user.name,
          })
        }
      } catch (error) {
        console.error('Error initializing PostHog:', error)
      }
    },
  })
}
