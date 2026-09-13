import { describe, expect, it } from 'vitest'
import { resolveBillingFeatureEnabled } from './billing-feature.ts'

describe('resolveBillingFeatureEnabled', () => {
  it('is disabled on the live production site', () => {
    expect(resolveBillingFeatureEnabled('production')).toBe(false)
  })

  it('is enabled in preview', () => {
    expect(resolveBillingFeatureEnabled('preview')).toBe(true)
  })

  it('is enabled in local dev (undefined NEXT_PUBLIC_ENV)', () => {
    expect(resolveBillingFeatureEnabled(undefined)).toBe(true)
  })

  it('NEXT_PUBLIC_BILLING_FEATURE_ENABLED=true turns billing on in production', () => {
    expect(resolveBillingFeatureEnabled('production', 'true')).toBe(true)
    expect(resolveBillingFeatureEnabled('production', '1')).toBe(true)
  })

  it('NEXT_PUBLIC_BILLING_FEATURE_ENABLED=false turns billing off in preview', () => {
    expect(resolveBillingFeatureEnabled('preview', 'false')).toBe(false)
    expect(resolveBillingFeatureEnabled('preview', '0')).toBe(false)
  })

  it('ignores an unrecognised flag value and falls back to the env default', () => {
    expect(resolveBillingFeatureEnabled('production', 'yes')).toBe(false)
    expect(resolveBillingFeatureEnabled('preview', '')).toBe(true)
  })
})
