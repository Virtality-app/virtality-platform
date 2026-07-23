import posthog from 'posthog-js'

if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
  throw new Error('NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is not set')
}

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN, {
  api_host: '/ph',
  ui_host: 'https://eu.posthog.com',
  defaults: '2026-05-30',
  persistence: 'localStorage+cookie',
  cookieless_mode: 'on_reject',
  loaded: (client) => {
    const consent = localStorage.getItem('analytics:consent')
    if (consent === 'granted') {
      client.opt_in_capturing()
    }
  },
})
