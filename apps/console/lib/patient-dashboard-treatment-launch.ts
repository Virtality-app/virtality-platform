import i18next from '@/i18n/i18next'

export type TreatmentLaunchReadiness = {
  consoleConnected: boolean
  headsetPresent: boolean
  /** Entitlement Clock / admin-tester VR soft gate. */
  entitlementAllowsLaunch: boolean
  /** Standing query still loading; launch is held until it resolves. */
  entitlementPending?: boolean
}

/** Translation keys in `patient-dashboard`. */
export const TREATMENT_LAUNCH_ERROR = {
  consoleDisconnected: 'launchError.consoleDisconnected',
  headsetAbsent: 'launchError.headsetAbsent',
  entitlementExpired: 'launchError.entitlementExpired',
  entitlementPending: 'launchError.entitlementPending',
} as const

export function canLaunchTreatment({
  consoleConnected,
  headsetPresent,
  entitlementAllowsLaunch,
  entitlementPending = false,
}: TreatmentLaunchReadiness): boolean {
  return (
    consoleConnected &&
    headsetPresent &&
    !entitlementPending &&
    entitlementAllowsLaunch
  )
}

export function getTreatmentLaunchError({
  consoleConnected,
  headsetPresent,
  entitlementAllowsLaunch,
  entitlementPending = false,
}: TreatmentLaunchReadiness): string | null {
  const translate = (key: string) => i18next.t(key, { ns: 'patient-dashboard' })

  if (entitlementPending) {
    return translate(TREATMENT_LAUNCH_ERROR.entitlementPending)
  }

  if (!entitlementAllowsLaunch) {
    return translate(TREATMENT_LAUNCH_ERROR.entitlementExpired)
  }

  if (!consoleConnected) {
    return translate(TREATMENT_LAUNCH_ERROR.consoleDisconnected)
  }

  if (!headsetPresent) {
    return translate(TREATMENT_LAUNCH_ERROR.headsetAbsent)
  }

  return null
}
