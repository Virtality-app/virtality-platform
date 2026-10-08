import { describe, expect, it } from 'vitest'
import { resolveHomeDashboardEnabled } from './home-dashboard-feature.ts'

describe('resolveHomeDashboardEnabled', () => {
  it('is disabled on the live production site', () => {
    expect(resolveHomeDashboardEnabled('production')).toBe(false)
  })

  it('is enabled in preview and local dev', () => {
    expect(resolveHomeDashboardEnabled('preview')).toBe(true)
    expect(resolveHomeDashboardEnabled(undefined)).toBe(true)
  })

  it('NEXT_PUBLIC_HOME_DASHBOARD_ENABLED overrides the env default', () => {
    expect(resolveHomeDashboardEnabled('production', 'true')).toBe(true)
    expect(resolveHomeDashboardEnabled('preview', 'false')).toBe(false)
  })

  it('ignores an unrecognised flag value', () => {
    expect(resolveHomeDashboardEnabled('production', 'yes')).toBe(false)
  })
})
