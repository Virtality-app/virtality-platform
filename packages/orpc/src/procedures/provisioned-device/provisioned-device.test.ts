import type { PrismaClient } from '@virtality/db'
import { describe, expect, it, vi } from 'vitest'
import { startDevicePairing } from '../device-pairing/device-pairing.ts'
import {
  createProvisionedDevice,
  detachProvisionedDevice,
  listProvisionedDevices,
  moveProvisionedDevice,
  nextHeadsetName,
  removeProvisionedDevice,
  unpairProvisionedDevice,
} from './provisioned-device.ts'

const NOW = new Date('2026-11-14T10:00:00.000Z')
const DAY_MS = 24 * 60 * 60 * 1000

/** A Prisma double whose transaction client is the same object. */
function fakePrisma(overrides: {
  /** Whether the Access Code is still unused and unexpired. */
  codeOpen?: boolean
  updated?: number
  existing?: { userId: string | null } | null
}) {
  const prisma = {
    trialRedeemCode: {
      updateMany: vi
        .fn()
        .mockResolvedValue({ count: overrides.codeOpen === false ? 0 : 1 }),
    },
    device: {
      create: vi.fn(async ({ data }: { data: unknown }) => data),
      updateMany: vi.fn().mockResolvedValue({ count: overrides.updated ?? 1 }),
      findFirst: vi.fn().mockResolvedValue(overrides.existing ?? null),
      findUniqueOrThrow: vi.fn().mockResolvedValue({ id: 'dev-1' }),
      findMany: vi.fn().mockResolvedValue([]),
    },
    devicePairingAttempt: {
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    $transaction: vi.fn(),
  }
  prisma.$transaction.mockImplementation(
    async (operation: (tx: unknown) => unknown) => operation(prisma),
  )
  return prisma
}

const asPrisma = (fake: ReturnType<typeof fakePrisma>) =>
  fake as unknown as PrismaClient

describe('Provisioned Devices', () => {
  it('creates a Device with no owner on an open Access Code', async () => {
    const fake = fakePrisma({})
    fake.device.findMany.mockResolvedValue([
      { name: 'Headset-01' },
      { name: 'Headset-03' },
    ])

    await createProvisionedDevice(
      asPrisma(fake),
      { accessCodeId: 7 },
      { now: () => NOW, createId: () => 'dev-1' },
    )

    expect(fake.device.create).toHaveBeenCalledWith({
      data: {
        id: 'dev-1',
        name: 'Headset-04',
        accessCodeId: 7,
        userId: null,
      },
      select: expect.any(Object),
    })
  })

  it('locks the open code in the same transaction as the write', async () => {
    const fake = fakePrisma({})

    await createProvisionedDevice(
      asPrisma(fake),
      { accessCodeId: 7 },
      { now: () => NOW, createId: () => 'dev-1' },
    )

    // A no-op write on the code row holds its lock until the Device is
    // written, so a redemption racing this one waits and then sees it.
    expect(fake.$transaction).toHaveBeenCalledTimes(1)
    expect(fake.trialRedeemCode.updateMany).toHaveBeenCalledWith({
      where: {
        id: 7,
        status: 'unused',
        createdAt: { gt: new Date(NOW.getTime() - 7 * DAY_MS) },
      },
      data: { status: 'unused' },
    })
  })

  it('creates a Device in inventory when no code is given', async () => {
    const fake = fakePrisma({})

    await createProvisionedDevice(
      asPrisma(fake),
      { accessCodeId: null },
      { now: () => NOW, createId: () => 'dev-1' },
    )

    expect(fake.trialRedeemCode.updateMany).not.toHaveBeenCalled()
    expect(fake.device.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ accessCodeId: null, userId: null }),
      }),
    )
  })

  it('refuses to put a headset on a used, expired or missing Access Code', async () => {
    const fake = fakePrisma({ codeOpen: false })

    await expect(
      createProvisionedDevice(
        asPrisma(fake),
        { accessCodeId: 7 },
        { now: () => NOW, createId: () => 'dev-1' },
      ),
    ).rejects.toMatchObject({ code: 'ACCESS_CODE_UNAVAILABLE' })
    expect(fake.device.create).not.toHaveBeenCalled()
  })

  it('moves a Device with no owner to another open code, keeping it paired', async () => {
    const fake = fakePrisma({})

    await moveProvisionedDevice(
      asPrisma(fake),
      { deviceRecordId: 'dev-1', accessCodeId: 9 },
      { now: () => NOW },
    )

    expect(fake.device.updateMany).toHaveBeenCalledWith({
      where: { id: 'dev-1', userId: null, deletedAt: null },
      data: { accessCodeId: 9 },
    })
  })

  it('refuses to move a Device onto a code that is no longer open', async () => {
    const fake = fakePrisma({ codeOpen: false })

    await expect(
      moveProvisionedDevice(
        asPrisma(fake),
        { deviceRecordId: 'dev-1', accessCodeId: 9 },
        { now: () => NOW },
      ),
    ).rejects.toMatchObject({ code: 'ACCESS_CODE_UNAVAILABLE' })
    expect(fake.device.updateMany).not.toHaveBeenCalled()
  })

  it('detaches a Device with no owner to inventory', async () => {
    const fake = fakePrisma({})

    await detachProvisionedDevice(asPrisma(fake), { deviceRecordId: 'dev-1' })

    expect(fake.device.updateMany).toHaveBeenCalledWith({
      where: { id: 'dev-1', userId: null, deletedAt: null },
      data: { accessCodeId: null },
    })
  })

  it.each([
    [
      'move',
      (p: PrismaClient) =>
        moveProvisionedDevice(
          p,
          { deviceRecordId: 'dev-1', accessCodeId: 7 },
          { now: () => NOW },
        ),
    ],
    [
      'detach',
      (p: PrismaClient) =>
        detachProvisionedDevice(p, { deviceRecordId: 'dev-1' }),
    ],
    [
      'unpair',
      (p: PrismaClient) =>
        unpairProvisionedDevice(
          p,
          { deviceRecordId: 'dev-1' },
          { now: () => NOW },
        ),
    ],
    [
      'remove',
      (p: PrismaClient) =>
        removeProvisionedDevice(
          p,
          { deviceRecordId: 'dev-1' },
          { now: () => NOW },
        ),
    ],
  ])('refuses to %s a Device a customer owns', async (_label, run) => {
    const fake = fakePrisma({ updated: 0, existing: { userId: 'user-1' } })

    await expect(run(asPrisma(fake))).rejects.toMatchObject({
      code: 'DEVICE_OWNED',
    })
    expect(fake.devicePairingAttempt.updateMany).not.toHaveBeenCalled()
  })

  it('reports a missing Device as not found', async () => {
    const fake = fakePrisma({ updated: 0, existing: null })

    await expect(
      detachProvisionedDevice(asPrisma(fake), { deviceRecordId: 'dev-x' }),
    ).rejects.toMatchObject({ code: 'DEVICE_NOT_FOUND' })
  })

  it('unpairs a Device with no owner and cancels its pending claim', async () => {
    const fake = fakePrisma({})

    await unpairProvisionedDevice(
      asPrisma(fake),
      { deviceRecordId: 'dev-1' },
      { now: () => NOW },
    )

    expect(fake.device.updateMany).toHaveBeenCalledWith({
      where: { id: 'dev-1', userId: null, deletedAt: null },
      data: { deviceId: null },
    })
    expect(fake.devicePairingAttempt.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deviceRecordId: 'dev-1', status: 'PENDING' },
        data: expect.objectContaining({ status: 'CANCELLED' }),
      }),
    )
  })

  it('removes a Device with no owner and frees its headset', async () => {
    const fake = fakePrisma({})

    await removeProvisionedDevice(
      asPrisma(fake),
      { deviceRecordId: 'dev-1' },
      { now: () => NOW },
    )

    expect(fake.device.updateMany).toHaveBeenCalledWith({
      where: { id: 'dev-1', userId: null, deletedAt: null },
      data: { deletedAt: NOW, deviceId: null },
    })
  })

  it('lists Devices with no owner and those a code delivered', async () => {
    const fake = fakePrisma({})
    fake.device.findMany.mockResolvedValue([
      {
        id: 'dev-1',
        name: 'Clinic headset',
        model: null,
        deviceId: 'headset-1',
        accessCodeId: 7,
        accessCode: { code: 'GO-ABCDEFGHIJ' },
        userId: 'user-1',
        createdAt: NOW,
      },
      {
        id: 'dev-2',
        name: 'Spare',
        model: null,
        deviceId: null,
        accessCodeId: null,
        accessCode: null,
        userId: null,
        createdAt: NOW,
      },
    ])

    await expect(listProvisionedDevices(asPrisma(fake))).resolves.toEqual([
      expect.objectContaining({
        id: 'dev-1',
        accessCode: 'GO-ABCDEFGHIJ',
        paired: true,
        owned: true,
      }),
      expect.objectContaining({
        id: 'dev-2',
        accessCode: null,
        paired: false,
        owned: false,
      }),
    ])
    expect(fake.device.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          OR: [{ userId: null }, { accessCodeId: { not: null } }],
        },
      }),
    )
    // The list never exposes who owns a Device.
    expect(
      (await listProvisionedDevices(asPrisma(fake)))[0],
    ).not.toHaveProperty('userId')
  })
})

describe('Provisioned Device names', () => {
  it('numbers headsets after the highest one so far', () => {
    expect(nextHeadsetName([])).toBe('Headset-01')
    expect(nextHeadsetName(['Headset-01', 'Headset-07', 'Headset-03'])).toBe(
      'Headset-08',
    )
    expect(nextHeadsetName(['Headset-99'])).toBe('Headset-100')
  })

  it('ignores names that are not in the Headset-## scheme', () => {
    expect(nextHeadsetName(['Clinic room 2', 'Headset-x', 'Headset-02'])).toBe(
      'Headset-03',
    )
  })

  it('reads every staff-made Device, removed ones too, so no name repeats', async () => {
    const fake = fakePrisma({})

    await createProvisionedDevice(
      asPrisma(fake),
      { accessCodeId: null },
      { now: () => NOW, createId: () => 'dev-1' },
    )

    expect(fake.device.findMany).toHaveBeenCalledWith({
      where: {
        name: { startsWith: 'Headset-' },
        OR: [{ userId: null }, { accessCodeId: { not: null } }],
      },
      select: { name: true },
    })
  })
})

describe('staff Pairing Claim', () => {
  it('starts a claim on a Device with no owner for a staff member', async () => {
    const fake = fakePrisma({})
    fake.device.findFirst.mockResolvedValue({ id: 'dev-1', deviceId: null })
    const create = vi.fn().mockResolvedValue({
      id: 'attempt-1',
      code: '123456',
      expiresAt: NOW,
    })
    Object.assign(fake.devicePairingAttempt, { create })

    await expect(
      startDevicePairing(
        asPrisma(fake),
        { deviceRecordId: 'dev-1', userId: 'staff-1', provisioned: true },
        { now: () => NOW, generateCode: () => '123456' },
      ),
    ).resolves.toMatchObject({ code: '123456' })

    expect(fake.device.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'dev-1', userId: null, deletedAt: null },
      }),
    )
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'staff-1' }),
      }),
    )
  })
})
