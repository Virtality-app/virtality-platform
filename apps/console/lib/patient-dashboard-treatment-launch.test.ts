import { describe, expect, it } from 'vitest'
import {
  canLaunchTreatment,
  getTreatmentLaunchError,
} from './patient-dashboard-treatment-launch.js'

describe('patient dashboard treatment launch gating', () => {
  it('blocks Start and Warmup when only the console is connected', () => {
    expect(
      canLaunchTreatment({
        consoleConnected: true,
        headsetPresent: false,
        entitlementAllowsLaunch: true,
      }),
    ).toBe(false)
  })

  it('allows Start and Warmup after the room is complete', () => {
    expect(
      canLaunchTreatment({
        consoleConnected: true,
        headsetPresent: true,
        entitlementAllowsLaunch: true,
      }),
    ).toBe(true)
  })

  it('blocks launch when the console is not connected', () => {
    expect(
      canLaunchTreatment({
        consoleConnected: false,
        headsetPresent: true,
        entitlementAllowsLaunch: true,
      }),
    ).toBe(false)
    expect(
      canLaunchTreatment({
        consoleConnected: false,
        headsetPresent: false,
        entitlementAllowsLaunch: true,
      }),
    ).toBe(false)
  })

  it('blocks launch when Remaining Time entitlement is expired', () => {
    expect(
      canLaunchTreatment({
        consoleConnected: true,
        headsetPresent: true,
        entitlementAllowsLaunch: false,
      }),
    ).toBe(false)
  })
})

describe('getTreatmentLaunchError', () => {
  it('holds launch while entitlement standing is still loading', () => {
    const pending = {
      consoleConnected: true,
      headsetPresent: true,
      entitlementAllowsLaunch: true,
      entitlementPending: true,
    }
    expect(canLaunchTreatment(pending)).toBe(false)
    expect(getTreatmentLaunchError(pending)).toBe('Checking Remaining Time…')
  })

  it('reports entitlement expiry before connection errors', () => {
    expect(
      getTreatmentLaunchError({
        consoleConnected: false,
        headsetPresent: false,
        entitlementAllowsLaunch: false,
      }),
    ).toBe(
      'Remaining Time expired. Subscribe to continue launching the VR program.',
    )
  })

  it('reports console disconnection before headset absence', () => {
    expect(
      getTreatmentLaunchError({
        consoleConnected: false,
        headsetPresent: false,
        entitlementAllowsLaunch: true,
      }),
    ).toBe('Please connect with a device!')
  })

  it('reports headset absence when the console is connected', () => {
    expect(
      getTreatmentLaunchError({
        consoleConnected: true,
        headsetPresent: false,
        entitlementAllowsLaunch: true,
      }),
    ).toBe('Waiting for the VR headset to connect.')
  })

  it('returns null when launch is ready', () => {
    expect(
      getTreatmentLaunchError({
        consoleConnected: true,
        headsetPresent: true,
        entitlementAllowsLaunch: true,
      }),
    ).toBeNull()
  })
})
