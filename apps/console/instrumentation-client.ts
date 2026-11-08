import posthog from 'posthog-js'
import { installTranslateCrashGuard } from './lib/translate-crash-guard'

installTranslateCrashGuard()

if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  throw new Error('POSTHOG_KEY is not set')
}

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
  api_host: '/ph',
  ui_host: 'https://eu.posthog.com',
  persistence: 'localStorage+cookie',
  cookieless_mode: 'on_reject',
  // App Router navigations are history changes; this replaces the old
  // hand-rolled page_viewed event.
  capture_pageview: 'history_change',
  autocapture: { url_ignorelist: ['http://localhost:3001'] },
  // Person identification lives in usePostHogIdentifyOnSession, which reads
  // the shared session store once PostHog reports loaded.
  loaded: (posthogClient) => {
    // Separates console events from the website's when both share a project.
    posthogClient.register({ app: 'console' })
    try {
      // Console defaults to opted-in so feature flags (e.g. rom_mode_feature)
      // and identify run without waiting on the cookie banner. Explicit
      // declines in localStorage are still respected.
      const consent = localStorage.getItem('analytics:consent')
      if (consent === 'denied') {
        posthogClient.opt_out_capturing()
      } else {
        posthogClient.opt_in_capturing()
        if (consent !== 'granted') {
          localStorage.setItem('analytics:consent', 'granted')
        }
      }
    } catch (error) {
      console.error('Error initializing PostHog:', error)
    }
  },
})
