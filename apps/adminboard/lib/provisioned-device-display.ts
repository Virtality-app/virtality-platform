import type { ProvisionedDeviceListItem } from '@virtality/react-query'

export function devicesOnAccessCode(
  devices: ProvisionedDeviceListItem[],
  accessCodeId: number,
): ProvisionedDeviceListItem[] {
  return devices.filter((device) => device.accessCodeId === accessCodeId)
}

/** Spares: no owner and no Access Code, so free to attach to a code. */
export function inventoryDevices(
  devices: ProvisionedDeviceListItem[],
): ProvisionedDeviceListItem[] {
  return devices.filter(
    (device) => !device.owned && device.accessCodeId == null,
  )
}

/** The Access Codes table, searched for one code. */
export function accessCodeSearchHref(code: string): string {
  return `/trial-redeem-codes?search=${encodeURIComponent(code)}`
}

export function customerProfileHref(userId: string): string {
  return `/customers/${encodeURIComponent(userId)}`
}

export function formatHeadsetSummary(
  devices: ProvisionedDeviceListItem[],
): string {
  if (devices.length === 0) return '—'
  const paired = devices.filter((device) => device.paired).length
  const noun = devices.length === 1 ? 'headset' : 'headsets'
  return `${devices.length} ${noun} · ${paired} paired`
}

/** Delivered: a customer redeemed the code and owns the Device. */
export function provisionedDeviceStatusLabel(
  device: Pick<ProvisionedDeviceListItem, 'paired' | 'owned'>,
): string {
  if (device.owned) return 'Delivered'
  return device.paired ? 'Paired' : 'Not paired'
}

export function secondsUntil(expiresAt: Date, now: Date): number {
  return Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / 1000))
}

export function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}

/** What the headsets dialog is showing. One dialog walks through these. */
export type HeadsetStep =
  | { kind: 'list' }
  | { kind: 'attach' }
  | { kind: 'pair'; device: Pick<ProvisionedDeviceListItem, 'id' | 'name'> }
  | { kind: 'move'; device: ProvisionedDeviceListItem }

/** Dialog heading for a step. `accessCode` is null in inventory. */
export function headsetStepHeading(
  step: HeadsetStep,
  accessCode: string | null,
): { title: string; description: string } {
  switch (step.kind) {
    case 'list':
      return {
        title: `Headsets on ${accessCode ?? 'inventory'}`,
        description:
          'Whoever redeems this code owns these headsets, already paired.',
      }
    case 'attach':
      return accessCode
        ? {
            title: `Attach a headset to ${accessCode}`,
            description: 'Adds the next Headset-## and pairs it here.',
          }
        : {
            title: 'Add a headset to inventory',
            description:
              'Adds the next Headset-## with no code. Move it to a code to send it to a customer.',
          }
    case 'pair':
      return {
        title: `Pair ${step.device.name}`,
        description: 'Put the headset on, open pairing and enter this code.',
      }
    case 'move':
      return {
        title: `Move ${step.device.name}`,
        description:
          'The headset stays paired. Whoever redeems the new code owns it.',
      }
  }
}
