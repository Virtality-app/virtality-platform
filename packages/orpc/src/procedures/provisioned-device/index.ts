import { ORPCError } from '@orpc/server'
import { z } from 'zod/v4'
import { adminAuthed } from '../../middleware/admin.ts'
import {
  cancelDevicePairing,
  getDevicePairingStatus,
  startDevicePairing,
} from '../device-pairing/device-pairing.ts'
import { throwPairingOrpcError } from '../device-pairing/index.ts'
import {
  createProvisionedDevice,
  detachProvisionedDevice,
  listProvisionedDevices,
  moveProvisionedDevice,
  ProvisionedDeviceError,
  removeProvisionedDevice,
  unpairProvisionedDevice,
} from './provisioned-device.ts'

const accessCodeIdSchema = z.number().int().positive()

const DeviceRecordInputSchema = z.object({
  deviceRecordId: z.string().trim().min(1),
})

const PairingAttemptInputSchema = z.object({
  attemptId: z.string().trim().min(1),
})

const CreateInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  model: z.string().trim().max(100).nullable().optional(),
  accessCodeId: accessCodeIdSchema.nullable().optional(),
})

const MoveInputSchema = DeviceRecordInputSchema.extend({
  accessCodeId: accessCodeIdSchema,
})

function throwProvisionedDeviceOrpcError(error: unknown): never {
  if (error instanceof ProvisionedDeviceError) {
    if (error.code === 'DEVICE_NOT_FOUND') {
      throw new ORPCError('NOT_FOUND', { message: error.message })
    }
    if (error.code === 'DEVICE_OWNED') {
      throw new ORPCError('CONFLICT', { message: error.message })
    }
    throw new ORPCError('BAD_REQUEST', { message: error.message })
  }
  throw error
}

async function run<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    throwProvisionedDeviceOrpcError(error)
  }
}

const list = adminAuthed
  .route({ path: '/provisioned-device/list', method: 'GET' })
  .handler(({ context }) => listProvisionedDevices(context.prisma))

const create = adminAuthed
  .route({ path: '/provisioned-device/create', method: 'POST' })
  .input(CreateInputSchema)
  .handler(({ context, input }) =>
    run(() =>
      createProvisionedDevice(context.prisma, {
        name: input.name,
        model: input.model || null,
        accessCodeId: input.accessCodeId ?? null,
      }),
    ),
  )

const move = adminAuthed
  .route({ path: '/provisioned-device/move', method: 'POST' })
  .input(MoveInputSchema)
  .handler(({ context, input }) =>
    run(() => moveProvisionedDevice(context.prisma, input)),
  )

const detach = adminAuthed
  .route({ path: '/provisioned-device/detach', method: 'POST' })
  .input(DeviceRecordInputSchema)
  .handler(({ context, input }) =>
    run(() => detachProvisionedDevice(context.prisma, input)),
  )

const unpair = adminAuthed
  .route({ path: '/provisioned-device/unpair', method: 'POST' })
  .input(DeviceRecordInputSchema)
  .handler(({ context, input }) =>
    run(() => unpairProvisionedDevice(context.prisma, input)),
  )

const remove = adminAuthed
  .route({ path: '/provisioned-device/remove', method: 'POST' })
  .input(DeviceRecordInputSchema)
  .handler(({ context, input }) =>
    run(() => removeProvisionedDevice(context.prisma, input)),
  )

// The staff Pairing Claim reuses the clinician attempt lifecycle. The
// attempt belongs to the staff member; the target Device has no owner.
const startPairing = adminAuthed
  .route({ path: '/provisioned-device/pairing/start', method: 'POST' })
  .input(DeviceRecordInputSchema)
  .handler(async ({ context, input }) => {
    try {
      return await startDevicePairing(context.prisma, {
        deviceRecordId: input.deviceRecordId,
        userId: context.user.id,
        provisioned: true,
      })
    } catch (error) {
      throwPairingOrpcError(error)
    }
  })

const pairingStatus = adminAuthed
  .route({ path: '/provisioned-device/pairing/status', method: 'GET' })
  .input(PairingAttemptInputSchema)
  .handler(async ({ context, input }) => {
    try {
      return await getDevicePairingStatus(context.prisma, {
        attemptId: input.attemptId,
        userId: context.user.id,
      })
    } catch (error) {
      throwPairingOrpcError(error)
    }
  })

const cancelPairing = adminAuthed
  .route({ path: '/provisioned-device/pairing/cancel', method: 'POST' })
  .input(PairingAttemptInputSchema)
  .handler(async ({ context, input }) => {
    try {
      return await cancelDevicePairing(context.prisma, {
        attemptId: input.attemptId,
        userId: context.user.id,
      })
    } catch (error) {
      throwPairingOrpcError(error)
    }
  })

export const provisionedDevice = {
  list,
  create,
  move,
  detach,
  unpair,
  remove,
  pairing: {
    start: startPairing,
    status: pairingStatus,
    cancel: cancelPairing,
  },
}
