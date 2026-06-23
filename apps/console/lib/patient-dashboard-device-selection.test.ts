import { describe, expect, it } from 'vitest'
import {
  isDashboardDeviceSelectable,
  resolveSavedHeadsetSelection,
} from './patient-dashboard-device-selection'

type TestDevice = {
  data: {
    id: string
    deviceId: string | null
  }
}

const devices: TestDevice[] = [
  { data: { id: 'device-online', deviceId: 'room-a' } },
  { data: { id: 'device-offline', deviceId: 'room-b' } },
  { data: { id: 'device-unpaired', deviceId: null } },
]

describe('patient dashboard device selection', () => {
  it('treats paired devices as selectable regardless of VR presence', () => {
    expect(isDashboardDeviceSelectable({ deviceId: 'room-a' })).toBe(true)
    expect(isDashboardDeviceSelectable({ deviceId: 'room-b' })).toBe(true)
  })

  it('treats unpaired devices as not selectable', () => {
    expect(isDashboardDeviceSelectable({ deviceId: null })).toBe(false)
  })

  it('restores a paired saved last headset without clearing convenience state', () => {
    expect(resolveSavedHeadsetSelection(devices, 'device-offline')).toEqual({
      selectedDevice: devices[1],
      shouldClearSavedHeadset: false,
    })
  })

  it('clears an unpaired saved last headset without auto-picking another device', () => {
    expect(resolveSavedHeadsetSelection(devices, 'device-unpaired')).toEqual({
      selectedDevice: null,
      shouldClearSavedHeadset: true,
    })
  })

  it('leaves selection empty when no saved last headset exists', () => {
    expect(resolveSavedHeadsetSelection(devices, undefined)).toEqual({
      selectedDevice: null,
      shouldClearSavedHeadset: false,
    })
  })
})
