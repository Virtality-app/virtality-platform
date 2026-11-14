import { randomUUID } from 'node:crypto'
import type { PrismaClient } from '@virtality/db'
import {
  nextHeadsetName,
  TRIAL_REDEEM_CODE_TTL_MS,
} from '@virtality/shared/utils'

/**
 * Provisioned Devices (ADR 0011): Devices staff create and pair before a
 * customer exists. They have no owner, and are linked to an Access Code or
 * held in inventory. Every write here refuses a Device a customer owns.
 */

export type ProvisionedDeviceErrorCode =
  | 'DEVICE_NOT_FOUND'
  | 'DEVICE_OWNED'
  | 'ACCESS_CODE_UNAVAILABLE'

export class ProvisionedDeviceError extends Error {
  constructor(
    public readonly code: ProvisionedDeviceErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'ProvisionedDeviceError'
  }
}

type Clock = { now?: () => Date }

export type ProvisionedDeviceListItem = {
  id: string
  name: string
  model: string | null
  /** Headset Identity, once a headset has claimed the Device. */
  deviceId: string | null
  paired: boolean
  accessCodeId: number | null
  accessCode: string | null
  /** A customer redeemed the code; staff can no longer change the Device. */
  owned: boolean
  /** The customer who owns it, for linking to their profile in Adminboard. */
  owner: { id: string; name: string } | null
  createdAt: Date
}

const ownerless = (id: string) => ({ id, userId: null, deletedAt: null })

/**
 * Only an unused, unexpired Access Code can take a headset. Call inside the
 * transaction that writes the Device: the no-op update locks the code row
 * until commit, so a redemption racing it either waits and then sees the
 * Device, or wins first and this check fails.
 */
async function lockOpenAccessCode(
  tx: Pick<PrismaClient, 'trialRedeemCode'>,
  accessCodeId: number,
  now: Date,
) {
  const { count } = await tx.trialRedeemCode.updateMany({
    where: {
      id: accessCodeId,
      status: 'unused',
      createdAt: { gt: new Date(now.getTime() - TRIAL_REDEEM_CODE_TTL_MS) },
    },
    data: { status: 'unused' },
  })
  if (count === 0) {
    throw new ProvisionedDeviceError(
      'ACCESS_CODE_UNAVAILABLE',
      'That Access Code is used, expired or missing.',
    )
  }
}

/** Throws the reason an ownerless-only write matched no Device. */
async function throwWhyNotOwnerless(
  prisma: Pick<PrismaClient, 'device'>,
  deviceRecordId: string,
): Promise<never> {
  const existing = await prisma.device.findFirst({
    where: { id: deviceRecordId, deletedAt: null },
    select: { userId: true },
  })
  if (existing) {
    throw new ProvisionedDeviceError(
      'DEVICE_OWNED',
      'A customer owns this Device, so staff can no longer change it.',
    )
  }
  throw new ProvisionedDeviceError('DEVICE_NOT_FOUND', 'Device not found.')
}

async function updateOwnerless(
  prisma: Pick<PrismaClient, 'device'>,
  deviceRecordId: string,
  data: {
    accessCodeId?: number | null
    name?: string
    deviceId?: null
    deletedAt?: Date
  },
) {
  const { count } = await prisma.device.updateMany({
    where: ownerless(deviceRecordId),
    data,
  })
  if (count === 0) await throwWhyNotOwnerless(prisma, deviceRecordId)
}

/** Unpair and removal end any claim in flight, as they do for clinicians. */
async function writeAndCancelPendingClaims(
  prisma: PrismaClient,
  deviceRecordId: string,
  data: { deviceId: null; deletedAt?: Date },
  now: Date,
) {
  await prisma.$transaction(async (tx) => {
    await updateOwnerless(tx, deviceRecordId, data)
    await tx.devicePairingAttempt.updateMany({
      where: { deviceRecordId, status: 'PENDING' },
      data: {
        status: 'CANCELLED',
        activeCode: null,
        activeDeviceKey: null,
        cancelledAt: now,
      },
    })
  })
}

const listSelect = {
  id: true,
  name: true,
  model: true,
  deviceId: true,
  accessCodeId: true,
  userId: true,
  createdAt: true,
  accessCode: { select: { code: true } },
  user: { select: { id: true, name: true } },
} as const

type ListRow = {
  id: string
  name: string
  model: string | null
  deviceId: string | null
  accessCodeId: number | null
  userId: string | null
  createdAt: Date
  accessCode: { code: string } | null
  user: { id: string; name: string } | null
}

function toListItem(row: ListRow): ProvisionedDeviceListItem {
  return {
    id: row.id,
    name: row.name,
    model: row.model,
    deviceId: row.deviceId,
    paired: row.deviceId != null,
    accessCodeId: row.accessCodeId,
    accessCode: row.accessCode?.code ?? null,
    owned: row.userId != null,
    owner: row.user ? { id: row.user.id, name: row.user.name } : null,
    createdAt: row.createdAt,
  }
}

/**
 * We ship one headset, so staff don't pick a model. Matches the console's
 * default for Devices clinicians add, which also picks the card's picture.
 */
export const PROVISIONED_HEADSET_MODEL = 'Meta Quest 3S'

/**
 * Names of the headsets already waiting where a Device is going: on the
 * Access Code, or in inventory when `accessCodeId` is null. Each of those
 * groups numbers its headsets from Headset-01 (see `nextHeadsetName`).
 */
async function namesWaitingOn(
  tx: Pick<PrismaClient, 'device'>,
  accessCodeId: number | null,
  except?: string,
): Promise<string[]> {
  const rows = await tx.device.findMany({
    where: {
      accessCodeId,
      userId: null,
      deletedAt: null,
      ...(except ? { id: { not: except } } : {}),
    },
    select: { name: true },
  })
  return rows.map((row) => row.name)
}

function getPrismaErrorCode(error: unknown): unknown {
  return error && typeof error === 'object' && 'code' in error
    ? (error as { code?: unknown }).code
    : undefined
}

type Tx = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0]

/**
 * Picking the next number reads a group, then writes into it. Serializable
 * makes two admins doing that at once conflict; the loser retries and reads
 * the winner's headset.
 */
async function serializable<T>(
  prisma: PrismaClient,
  operation: (tx: Tx) => Promise<T>,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await prisma.$transaction(operation, {
        isolationLevel: 'Serializable',
      })
    } catch (error) {
      if (getPrismaErrorCode(error) !== 'P2034' || attempt === 4) throw error
    }
  }
}

/**
 * Creates a Provisioned Device, named after the headsets already on its
 * code (or in inventory when `accessCodeId` is null). Staff pick only where
 * it goes.
 */
export async function createProvisionedDevice(
  prisma: PrismaClient,
  input: { accessCodeId: number | null },
  runtime: Clock & { createId?: () => string } = {},
): Promise<ProvisionedDeviceListItem> {
  const now = runtime.now?.() ?? new Date()
  const { accessCodeId } = input

  const row = await serializable(prisma, async (tx) => {
    if (accessCodeId != null) await lockOpenAccessCode(tx, accessCodeId, now)
    return tx.device.create({
      data: {
        id: runtime.createId?.() ?? randomUUID(),
        name: nextHeadsetName(await namesWaitingOn(tx, accessCodeId)),
        model: PROVISIONED_HEADSET_MODEL,
        accessCodeId,
        userId: null,
      },
      select: listSelect,
    })
  })
  return toListItem(row)
}

/** Devices with no owner, plus Devices a code has already delivered. */
export async function listProvisionedDevices(
  prisma: PrismaClient,
): Promise<ProvisionedDeviceListItem[]> {
  const rows = await prisma.device.findMany({
    where: {
      deletedAt: null,
      OR: [{ userId: null }, { accessCodeId: { not: null } }],
    },
    orderBy: { createdAt: 'desc' },
    select: listSelect,
  })
  return rows.map(toListItem)
}

export async function moveProvisionedDevice(
  prisma: PrismaClient,
  input: { deviceRecordId: string; accessCodeId: number },
  runtime: Clock = {},
): Promise<{ name: string }> {
  const now = runtime.now?.() ?? new Date()
  return serializable(prisma, async (tx) => {
    await lockOpenAccessCode(tx, input.accessCodeId, now)
    const taken = await namesWaitingOn(
      tx,
      input.accessCodeId,
      input.deviceRecordId,
    )
    // Renamed to follow the headsets already on the new code.
    const name = nextHeadsetName(taken)
    await updateOwnerless(tx, input.deviceRecordId, {
      accessCodeId: input.accessCodeId,
      name,
    })
    return { name }
  })
}

export async function detachProvisionedDevice(
  prisma: PrismaClient,
  input: { deviceRecordId: string },
): Promise<void> {
  await serializable(prisma, async (tx) => {
    const taken = await namesWaitingOn(tx, null, input.deviceRecordId)
    await updateOwnerless(tx, input.deviceRecordId, {
      accessCodeId: null,
      name: nextHeadsetName(taken),
    })
  })
}

export async function unpairProvisionedDevice(
  prisma: PrismaClient,
  input: { deviceRecordId: string },
  runtime: Clock = {},
): Promise<void> {
  const now = runtime.now?.() ?? new Date()
  await writeAndCancelPendingClaims(
    prisma,
    input.deviceRecordId,
    { deviceId: null },
    now,
  )
}

export async function removeProvisionedDevice(
  prisma: PrismaClient,
  input: { deviceRecordId: string },
  runtime: Clock = {},
): Promise<void> {
  const now = runtime.now?.() ?? new Date()
  await writeAndCancelPendingClaims(
    prisma,
    input.deviceRecordId,
    { deviceId: null, deletedAt: now },
    now,
  )
}
