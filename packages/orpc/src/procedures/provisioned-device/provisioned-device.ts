import { randomUUID } from 'node:crypto'
import type { PrismaClient } from '@virtality/db'
import { TRIAL_REDEEM_CODE_TTL_MS } from '@virtality/shared/utils'

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
  data: { accessCodeId?: number | null; deviceId?: null; deletedAt?: Date },
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
    createdAt: row.createdAt,
  }
}

const HEADSET_NAME = /^Headset-(\d+)$/

/** `Headset-01`, `Headset-02`, … after the highest number so far. */
export function nextHeadsetName(existingNames: string[]): string {
  const highest = existingNames.reduce((max, name) => {
    const match = HEADSET_NAME.exec(name)
    return match ? Math.max(max, Number(match[1])) : max
  }, 0)
  return `Headset-${String(highest + 1).padStart(2, '0')}`
}

function getPrismaErrorCode(error: unknown): unknown {
  return error && typeof error === 'object' && 'code' in error
    ? (error as { code?: unknown }).code
    : undefined
}

/**
 * Creates a Provisioned Device named `Headset-##`. Staff pick only where it
 * goes: an Access Code, or inventory when `accessCodeId` is null.
 */
export async function createProvisionedDevice(
  prisma: PrismaClient,
  input: { accessCodeId: number | null },
  runtime: Clock & { createId?: () => string } = {},
): Promise<ProvisionedDeviceListItem> {
  const now = runtime.now?.() ?? new Date()
  const { accessCodeId } = input

  const create = () =>
    prisma.$transaction(
      async (tx) => {
        if (accessCodeId != null)
          await lockOpenAccessCode(tx, accessCodeId, now)
        // Every Device staff ever made, removed ones too, so a name never
        // comes back. Clinicians' own Devices don't count.
        const taken = await tx.device.findMany({
          where: {
            name: { startsWith: 'Headset-' },
            OR: [{ userId: null }, { accessCodeId: { not: null } }],
          },
          select: { name: true },
        })
        return tx.device.create({
          data: {
            id: runtime.createId?.() ?? randomUUID(),
            name: nextHeadsetName(taken.map((device) => device.name)),
            accessCodeId,
            userId: null,
          },
          select: listSelect,
        })
      },
      // Two admins creating at once would read the same highest number.
      { isolationLevel: 'Serializable' },
    )

  for (let attempt = 0; ; attempt++) {
    try {
      return toListItem(await create())
    } catch (error) {
      if (getPrismaErrorCode(error) !== 'P2034' || attempt === 4) throw error
    }
  }
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
): Promise<void> {
  const now = runtime.now?.() ?? new Date()
  await prisma.$transaction(async (tx) => {
    await lockOpenAccessCode(tx, input.accessCodeId, now)
    await updateOwnerless(tx, input.deviceRecordId, {
      accessCodeId: input.accessCodeId,
    })
  })
}

export async function detachProvisionedDevice(
  prisma: PrismaClient,
  input: { deviceRecordId: string },
): Promise<void> {
  await updateOwnerless(prisma, input.deviceRecordId, { accessCodeId: null })
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
