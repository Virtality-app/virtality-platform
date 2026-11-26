import { DeviceSchema } from '@virtality/db/definitions'
import { ORPCError } from '@orpc/server'
import { authed } from '../middleware/auth.ts'

const listDevice = authed
  .route({ path: '/device/list', method: 'GET' })
  .handler(async ({ context }) => {
    const { prisma, user } = context
    const devices = await prisma.device.findMany({
      where: { userId: user.id, AND: [{ deletedAt: null }] },
    })
    return devices
  })

const createDevice = authed
  .route({ path: '/device/create', method: 'POST' })
  .input(DeviceSchema.omit({ userId: true, accessCodeId: true }))
  .handler(async ({ context, input }) => {
    const { prisma, user } = context
    // A new Device starts unbound: only pairing sets its Headset Identity,
    // so nobody can claim a headset they haven't paired.
    const device = await prisma.device.create({
      data: { ...input, deviceId: null, deletedAt: null, userId: user.id },
    })
    context.analytics?.capture({
      distinctId: user.id,
      event: 'headset_added',
      properties: { device_record_id: device.id },
    })
    return device
  })

const deleteDevice = authed
  .route({ path: '/device/delete', method: 'DELETE' })
  .input(DeviceSchema.pick({ id: true }))
  .handler(async ({ context, input }) => {
    const { prisma, user } = context
    const exists = await prisma.device.findFirst({
      where: { id: input.id, userId: user.id, deletedAt: null },
      select: { id: true },
    })
    if (!exists) {
      throw new ORPCError('NOT_FOUND', { message: 'Device not found.' })
    }

    const now = new Date()
    const device = await prisma.$transaction(async (tx) => {
      await tx.devicePairingAttempt.updateMany({
        where: { deviceRecordId: input.id, status: 'PENDING' },
        data: {
          status: 'CANCELLED',
          activeCode: null,
          activeDeviceKey: null,
          cancelledAt: now,
        },
      })

      return tx.device.update({
        data: { deletedAt: now, deviceId: null },
        where: { id: input.id },
      })
    })

    context.analytics?.capture({
      distinctId: user.id,
      event: 'headset_removed',
      properties: { device_record_id: device.id },
    })
    return device
  })

export const device = {
  list: listDevice,
  delete: deleteDevice,
  create: createDevice,
}
