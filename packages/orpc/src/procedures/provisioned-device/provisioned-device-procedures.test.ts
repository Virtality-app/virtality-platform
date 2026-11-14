import { call } from '@orpc/server'
import { describe, expect, it, vi } from 'vitest'
import { provisionedDevice } from './index.ts'

function contextFor(role: string) {
  const prisma = {
    device: {
      findMany: vi.fn(async () => []),
      updateMany: vi.fn(async () => ({ count: 1 })),
    },
  }
  return {
    prisma,
    context: {
      prisma,
      user: { id: 'user-1', role },
      session: { id: 's1' },
      headers: new Headers(),
    } as never,
  }
}

const calls = [
  ['list', () => [provisionedDevice.list, undefined]],
  ['create', () => [provisionedDevice.create, { name: 'Headset' }]],
  [
    'move',
    () => [provisionedDevice.move, { deviceRecordId: 'd', accessCodeId: 1 }],
  ],
  ['detach', () => [provisionedDevice.detach, { deviceRecordId: 'd' }]],
  ['unpair', () => [provisionedDevice.unpair, { deviceRecordId: 'd' }]],
  ['remove', () => [provisionedDevice.remove, { deviceRecordId: 'd' }]],
  [
    'pairing.start',
    () => [provisionedDevice.pairing.start, { deviceRecordId: 'd' }],
  ],
  [
    'pairing.status',
    () => [provisionedDevice.pairing.status, { attemptId: 'a' }],
  ],
  [
    'pairing.cancel',
    () => [provisionedDevice.pairing.cancel, { attemptId: 'a' }],
  ],
] as const

describe('provisionedDevice procedures', () => {
  it.each(calls)('%s is admin-only', async (_name, build) => {
    const [procedure, input] = build()
    const { context, prisma } = contextFor('user')

    await expect(
      call(procedure as never, input as never, { context }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
    expect(prisma.device.findMany).not.toHaveBeenCalled()
    expect(prisma.device.updateMany).not.toHaveBeenCalled()
  })

  it('lists for an admin', async () => {
    const { context } = contextFor('admin')

    await expect(
      call(provisionedDevice.list, undefined, { context }),
    ).resolves.toEqual([])
  })
})
