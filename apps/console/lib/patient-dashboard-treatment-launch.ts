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

export type TreatmentLaunchBlock = keyof typeof TREATMENT_LAUNCH_ERROR

export function resolveTreatmentLaunchBlock({
  consoleConnected,
  headsetPresent,
  entitlementAllowsLaunch,
  entitlementPending = false,
}: TreatmentLaunchReadiness): TreatmentLaunchBlock | null {
  if (entitlementPending) return 'entitlementPending'
  if (!entitlementAllowsLaunch) return 'entitlementExpired'
  if (!consoleConnected) return 'consoleDisconnected'
  if (!headsetPresent) return 'headsetAbsent'
  return null
}

export function getTreatmentLaunchError(
  readiness: TreatmentLaunchReadiness,
): string | null {
  const block = resolveTreatmentLaunchBlock(readiness)
  if (!block) return null
  return i18next.t(TREATMENT_LAUNCH_ERROR[block], { ns: 'patient-dashboard' })
}
