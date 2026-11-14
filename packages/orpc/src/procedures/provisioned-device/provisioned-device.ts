import { randomUUID } from 'node:crypto'
import type { PrismaClient } from '@virtality/db'
import { getTrialRedeemDisplayStatus } from '@virtality/shared/utils'

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

/** Only an unused, unexpired Access Code can take a headset. */
async function assertAccessCodeOpen(
  prisma: Pick<PrismaClient, 'trialRedeemCode'>,
  accessCodeId: number,
  now: Date,
) {
  const code = await prisma.trialRedeemCode.findUnique({
    where: { id: accessCodeId },
    select: { status: true, createdAt: true },
  })
  if (!code || getTrialRedeemDisplayStatus(code, now) !== 'unused') {
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

export async function createProvisionedDevice(
  prisma: PrismaClient,
  input: { name: string; model: string | null; accessCodeId: number | null },
  runtime: Clock & { createId?: () => string } = {},
): Promise<ProvisionedDeviceListItem> {
  const now = runtime.now?.() ?? new Date()
  if (input.accessCodeId != null) {
    await assertAccessCodeOpen(prisma, input.accessCodeId, now)
  }

  const row = await prisma.device.create({
    data: {
      id: runtime.createId?.() ?? randomUUID(),
      name: input.name,
      model: input.model,
      accessCodeId: input.accessCodeId,
      userId: null,
    },
    select: listSelect,
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
): Promise<void> {
  const now = runtime.now?.() ?? new Date()
  await assertAccessCodeOpen(prisma, input.accessCodeId, now)
  await updateOwnerless(prisma, input.deviceRecordId, {
    accessCodeId: input.accessCodeId,
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
