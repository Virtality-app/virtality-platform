export type DashboardDevice = {
  id: string
  deviceId: string | null
}

export function isDashboardDeviceSelectable(device: {
  deviceId: string | null
}): boolean {
  return Boolean(device.deviceId)
}

export function resolveSavedHeadsetSelection<
  T extends { data: DashboardDevice },
>(
  devices: T[] | undefined,
  lastHeadsetId: string | undefined,
): { selectedDevice: T | null; shouldClearSavedHeadset: boolean } {
  if (!lastHeadsetId || !devices) {
    return { selectedDevice: null, shouldClearSavedHeadset: false }
  }

  const savedDevice =
    devices.find((device) => device.data.id === lastHeadsetId) ?? null

  if (!savedDevice) {
    return { selectedDevice: null, shouldClearSavedHeadset: false }
  }

  if (!isDashboardDeviceSelectable(savedDevice.data)) {
    return { selectedDevice: null, shouldClearSavedHeadset: true }
  }

  return { selectedDevice: savedDevice, shouldClearSavedHeadset: false }
}
