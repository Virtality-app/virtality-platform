import type { ProvisionedDeviceListItem } from '@virtality/react-query'

export function devicesOnAccessCode(
  devices: ProvisionedDeviceListItem[],
  accessCodeId: number,
): ProvisionedDeviceListItem[] {
  return devices.filter((device) => device.accessCodeId === accessCodeId)
}

/** Inventory: no owner and no Access Code. */
export function inventoryDevices(
  devices: ProvisionedDeviceListItem[],
): ProvisionedDeviceListItem[] {
  return devices.filter(
    (device) => !device.owned && device.accessCodeId == null,
  )
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
