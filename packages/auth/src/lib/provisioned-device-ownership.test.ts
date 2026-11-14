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
  /** Provisioned Devices waiting on the code. */
  linkedDeviceIds?: string[]
  mode?: 'trial_grant' | 'free_grant'
}

function fakeClient({
  codeUpdated = 1,
  linkedDeviceIds = [],
  mode = 'trial_grant',
}: FakeOptions = {}) {
  const tx = {
    trialRedeemCode: {
      updateMany: vi.fn().mockResolvedValue({ count: codeUpdated }),
    },
    device: {
      updateManyAndReturn: vi
        .fn()
        .mockResolvedValue(linkedDeviceIds.map((id) => ({ id }))),
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
    expect(tx.device.updateManyAndReturn).toHaveBeenCalledWith({
      where: { accessCodeId: 7, userId: null, deletedAt: null },
      data: { userId: 'user-1' },
      select: { id: true },
    })
    expect(owned).toHaveBeenCalledWith({
      userId: 'user-1',
      deviceRecordIds: ['dev-1', 'dev-2'],
    })
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

    expect(tx.device.updateManyAndReturn).not.toHaveBeenCalled()
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

    expect(tx.device.updateManyAndReturn).toHaveBeenCalledWith(
      expect.objectContaining({ data: { userId: 'new-user' } }),
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
    expect(tx.device.updateManyAndReturn).toHaveBeenCalledWith(
      expect.objectContaining({ data: { userId: 'new-user' } }),
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

    expect(tx.device.updateManyAndReturn).toHaveBeenCalledWith(
      expect.objectContaining({ data: { userId: 'existing-user' } }),
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

    expect(tx.device.updateManyAndReturn).toHaveBeenCalledWith(
      expect.objectContaining({ data: { userId: 'existing-user' } }),
    )
  })
})
