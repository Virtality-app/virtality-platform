import { describe, expect, it } from 'vitest'
import type { ProvisionedDeviceListItem } from '@virtality/react-query'
import {
  accessCodeSearchHref,
  customerProfileHref,
  devicesOnAccessCode,
  formatHeadsetSummary,
  headsetStepHeading,
  inventoryDevices,
  provisionedDeviceStatusLabel,
  secondsUntil,
} from './provisioned-device-display'

const device = (
  overrides: Partial<ProvisionedDeviceListItem>,
): ProvisionedDeviceListItem => ({
  id: 'dev',
  name: 'Headset',
  model: null,
  deviceId: null,
  paired: false,
  accessCodeId: null,
  accessCode: null,
  owned: false,
  owner: null,
  createdAt: new Date('2026-11-14T10:00:00.000Z'),
  ...overrides,
})

describe('provisioned device display', () => {
  it('picks the Devices on one code', () => {
    const devices = [
      device({ id: 'a', accessCodeId: 7 }),
      device({ id: 'b', accessCodeId: 8 }),
      device({ id: 'c', accessCodeId: 7, owned: true }),
    ]

    expect(devicesOnAccessCode(devices, 7).map((d) => d.id)).toEqual(['a', 'c'])
  })

  it('keeps inventory to Devices with no owner and no code', () => {
    const devices = [
      device({ id: 'a' }),
      device({ id: 'b', accessCodeId: 7 }),
      device({ id: 'c', owned: true }),
    ]

    expect(inventoryDevices(devices).map((d) => d.id)).toEqual(['a'])
  })

  it('links to a code on the Access Codes table and to a customer', () => {
    expect(accessCodeSearchHref('GO-ABC12DEF34')).toBe(
      '/trial-redeem-codes?search=GO-ABC12DEF34',
    )
    expect(customerProfileHref('user 1')).toBe('/customers/user%201')
  })

  it('summarises a code’s headsets', () => {
    expect(formatHeadsetSummary([])).toBe('—')
    expect(
      formatHeadsetSummary([
        device({ paired: true }),
        device({ paired: false }),
      ]),
    ).toBe('2 headsets · 1 paired')
    expect(formatHeadsetSummary([device({ paired: true })])).toBe(
      '1 headset · 1 paired',
    )
  })

  it('labels a Device by where it is in its life', () => {
    expect(provisionedDeviceStatusLabel(device({}))).toBe('Not paired')
    expect(provisionedDeviceStatusLabel(device({ paired: true }))).toBe(
      'Paired',
    )
    expect(
      provisionedDeviceStatusLabel(device({ paired: true, owned: true })),
    ).toBe('Delivered')
  })

  it('counts down to an expiry without going negative', () => {
    const now = new Date('2026-11-14T10:00:00.000Z')
    expect(secondsUntil(new Date('2026-11-14T10:04:30.400Z'), now)).toBe(271)
    expect(secondsUntil(new Date('2026-11-14T09:59:00.000Z'), now)).toBe(0)
  })

  it('titles each step of the headsets dialog', () => {
    expect(headsetStepHeading({ kind: 'list' }, 'GO-1').title).toBe(
      'Headsets on GO-1',
    )
    expect(headsetStepHeading({ kind: 'attach' }, 'GO-1').title).toBe(
      'Attach a headset to GO-1',
    )
    expect(headsetStepHeading({ kind: 'add' }, 'GO-1').title).toBe(
      'Add a headset to GO-1',
    )
    expect(headsetStepHeading({ kind: 'add' }, null).title).toBe(
      'Add a headset to inventory',
    )
    expect(
      headsetStepHeading(
        { kind: 'pair', device: { id: 'd', name: 'Headset-03' } },
        'GO-1',
      ).title,
    ).toBe('Pair Headset-03')
  })
})
