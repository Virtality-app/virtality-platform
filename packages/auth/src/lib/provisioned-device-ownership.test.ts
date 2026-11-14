import type { PrismaClient } from '@virtality/db'
import {
  redeemAccessCodeOnProfile,
  redeemTrialCodeAfterSignUp,
  type ConsoleAccessCodeAccessGateIssuer,
} from '@virtality/shared/utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@virtality/db', () => ({ prisma: {} }))
// The variant adapter reaches the Better Auth instance, which needs SMTP and
// CDN settings at load. These tests never touch it.
vi.mock('../auth-instance.ts', () => ({ auth: {}, stripeClient: null }))
import { onProvisionedDevicesOwned } from './provisioned-device-ownership.ts'
import { createPrismaTrialRedeemConsumeStore } from './trial-redeem.ts'

const NOW = new Date('2026-11-14T10:00:00.000Z')

type FakeOptions = {
  /** Rows the code `updateMany` reports; 0 means the code was already used. */
  codeUpdated?: number
  /** Provisioned Devices waiting on the code, all with a headset bound. */
  linkedDeviceIds?: string[]
  /** Linked Devices staff never paired. */
  unpairedDeviceIds?: string[]
  /** Names of Devices the redeemer already owns. */
  ownedNames?: string[]
  mode?: 'trial_grant' | 'free_grant'
}

function fakeClient({
  codeUpdated = 1,
  linkedDeviceIds = [],
  unpairedDeviceIds = [],
  ownedNames = [],
  mode = 'trial_grant',
}: FakeOptions = {}) {
  // Waiting on the code they are numbered from Headset-01, in this order.
  const waiting = [
    ...linkedDeviceIds.map((id) => ({ id, deviceId: `headset-${id}` })),
    ...unpairedDeviceIds.map((id) => ({ id, deviceId: null })),
  ].map((device, i) => ({ ...device, name: `Headset-0${i + 1}` }))
  const tx = {
    trialRedeemCode: {
      updateMany: vi.fn().mockResolvedValue({ count: codeUpdated }),
    },
    device: {
      findMany: vi.fn(async ({ where }: { where: { userId?: unknown } }) =>
        where.userId === null ? waiting : ownedNames.map((name) => ({ name })),
      ),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
  }
  const client = {
    $transaction: vi.fn(async (operation: (t: typeof tx) => unknown) =>
      operation(tx),
    ),
    trialRedeemCode: {
      findUnique: vi.fn().mockResolvedValue({
        id: 7,
        code: 'GO-CLINIC0007',
        status: 'unused',
        mode,
        trialDays: 14,
        variant: null,
        createdAt: new Date('2026-11-13T10:00:00.000Z'),
        usedAt: null,
        usedBy: null,
      }),
    },
  }
  return { client: client as unknown as PrismaClient, tx }
}

function storeFor(client: PrismaClient, alreadyEntitled = false) {
  return {
    ...createPrismaTrialRedeemConsumeStore(client),
    userHasLiveDefaultSubscription: async () => alreadyEntitled,
  }
}

const accessGate: ConsoleAccessCodeAccessGateIssuer = {
  issueFreeGrant: async () => ({ accessGateId: 'gate-1' }),
  grantActiveTrial: async () => ({ accessGateId: 'gate-1' }),
  hasOpenGrantedAccessGate: async () => false,
  hasOpenTimedAccessGate: async () => false,
} as unknown as ConsoleAccessCodeAccessGateIssuer

afterEach(() => onProvisionedDevicesOwned(null))

describe('Provisioned Device ownership at redemption', () => {
  it('marks the code used and gives its linked Devices to the redeemer in one transaction', async () => {
    const { client, tx } = fakeClient({ linkedDeviceIds: ['dev-1', 'dev-2'] })
    const owned = vi.fn()
    onProvisionedDevicesOwned(owned)

    await expect(
      createPrismaTrialRedeemConsumeStore(client).consumeAsRedeemed(
        7,
        'user-1',
        NOW,
      ),
    ).resolves.toBe(true)

    expect(client.$transaction).toHaveBeenCalledTimes(1)
    expect(tx.trialRedeemCode.updateMany).toHaveBeenCalledWith({
      where: { id: 7, status: 'unused' },
      data: { status: 'redeemed', usedAt: NOW, usedBy: 'user-1' },
    })
    // A new account: its headsets keep Headset-01, Headset-02.
    expect(tx.device.updateMany).toHaveBeenCalledWith({
      where: { id: 'dev-1', accessCodeId: 7, userId: null, deletedAt: null },
      data: { userId: 'user-1', name: 'Headset-01' },
    })
    expect(tx.device.updateMany).toHaveBeenCalledWith({
      where: { id: 'dev-2', accessCodeId: 7, userId: null, deletedAt: null },
      data: { userId: 'user-1', name: 'Headset-02' },
    })
    expect(owned).toHaveBeenCalledWith({
      userId: 'user-1',
      deviceRecordIds: ['dev-1', 'dev-2'],
    })
  })

  it('reports only Devices that already have a headset as paired', async () => {
    const { client, tx } = fakeClient({
      linkedDeviceIds: ['dev-1'],
      unpairedDeviceIds: ['dev-2'],
    })
    const owned = vi.fn()
    onProvisionedDevicesOwned(owned)

    await createPrismaTrialRedeemConsumeStore(client).consumeAsRedeemed(
      7,
      'user-1',
      NOW,
    )

    // Both get the owner; the unpaired one reports when its owner pairs it.
    expect(tx.device.updateMany).toHaveBeenCalledTimes(2)
    expect(owned).toHaveBeenCalledWith({
      userId: 'user-1',
      deviceRecordIds: ['dev-1'],
    })
  })

  it('numbers arriving headsets after the ones the customer already has', async () => {
    const { client, tx } = fakeClient({
      linkedDeviceIds: ['dev-1', 'dev-2'],
      ownedNames: ['Headset-01', 'Front desk'],
    })

    await createPrismaTrialRedeemConsumeStore(client).consumeAsRedeemed(
      7,
      'user-1',
      NOW,
    )

    expect(tx.device.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', deletedAt: null },
      select: { name: true },
    })
    expect(tx.device.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'dev-1' }),
        data: { userId: 'user-1', name: 'Headset-02' },
      }),
    )
    expect(tx.device.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'dev-2' }),
        data: { userId: 'user-1', name: 'Headset-03' },
      }),
    )
  })

  it('leaves Devices alone when the code is no longer unused', async () => {
    const { client, tx } = fakeClient({ codeUpdated: 0 })
    const owned = vi.fn()
    onProvisionedDevicesOwned(owned)

    await expect(
      createPrismaTrialRedeemConsumeStore(client).consumeAsAlreadyEntitled(
        7,
        'user-1',
        NOW,
      ),
    ).resolves.toBe(false)

    expect(tx.device.findMany).not.toHaveBeenCalled()
    expect(tx.device.updateMany).not.toHaveBeenCalled()
    expect(owned).not.toHaveBeenCalled()
  })

  it('reports nothing when the code carries no headsets', async () => {
    const { client } = fakeClient({ linkedDeviceIds: [] })
    const owned = vi.fn()
    onProvisionedDevicesOwned(owned)

    await createPrismaTrialRedeemConsumeStore(client).consumeAsRedeemed(
      7,
      'user-1',
      NOW,
    )

    expect(owned).not.toHaveBeenCalled()
  })

  it('assigns the headset when a new user signs up with the code', async () => {
    const { client, tx } = fakeClient({ linkedDeviceIds: ['dev-1'] })

    await expect(
      redeemTrialCodeAfterSignUp(
        storeFor(client),
        accessGate,
        { code: 'GO-CLINIC0007', userId: 'new-user' },
        { now: () => NOW },
      ),
    ).resolves.toMatchObject({ status: 'redeemed' })

    expect(tx.device.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'new-user' }),
      }),
    )
  })

  it('assigns the headset at sign-up when the user is already entitled', async () => {
    const { client, tx } = fakeClient({ linkedDeviceIds: ['dev-1'] })

    await expect(
      redeemTrialCodeAfterSignUp(
        storeFor(client, true),
        accessGate,
        { code: 'GO-CLINIC0007', userId: 'new-user' },
        { now: () => NOW },
      ),
    ).resolves.toMatchObject({ status: 'already_entitled' })

    expect(tx.trialRedeemCode.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'already_entitled' }),
      }),
    )
    expect(tx.device.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'new-user' }),
      }),
    )
  })

  it('adds the headset for an existing user who redeems a Free code on Profile → Billing', async () => {
    const { client, tx } = fakeClient({
      linkedDeviceIds: ['dev-1'],
      mode: 'free_grant',
    })

    await expect(
      redeemAccessCodeOnProfile(
        storeFor(client),
        accessGate,
        { code: 'GO-CLINIC0007', userId: 'existing-user' },
        { now: () => NOW },
      ),
    ).resolves.toMatchObject({ effect: 'free_grant_created' })

    expect(tx.device.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'existing-user' }),
      }),
    )
  })

  it('assigns the headset on Profile → Billing when the user is already entitled', async () => {
    const { client, tx } = fakeClient({ linkedDeviceIds: ['dev-1'] })

    await expect(
      redeemAccessCodeOnProfile(
        storeFor(client, true),
        accessGate,
        { code: 'GO-CLINIC0007', userId: 'existing-user' },
        { now: () => NOW },
      ),
    ).resolves.toMatchObject({ effect: 'already_entitled' })

    expect(tx.device.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'existing-user' }),
      }),
    )
  })
})
