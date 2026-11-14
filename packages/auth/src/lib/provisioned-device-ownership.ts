import type { PrismaClient } from '@virtality/db'

/**
 * Provisioned Devices that just received their owner and already have a
 * headset bound (ADR 0011).
 */
export type ProvisionedDevicesOwned = {
  userId: string
  deviceRecordIds: string[]
}

type Listener = (owned: ProvisionedDevicesOwned) => void

let listener: Listener | null = null

/**
 * Registers the one listener told when redemption gives Provisioned Devices
 * an owner. The API server uses it to capture `headset_paired` for the new
 * owner. Pass `null` to clear it.
 */
export function onProvisionedDevicesOwned(next: Listener | null): void {
  listener = next
}

function notifyOwned(owned: ProvisionedDevicesOwned): void {
  if (owned.deviceRecordIds.length === 0 || !listener) return
  try {
    listener(owned)
  } catch {
    // A listener must never fail a redemption that already committed.
  }
}

/**
 * Marks an unused Access Code used and, in the same transaction, makes the
 * redeeming user the owner of every Provisioned Device linked to it. Returns
 * false, and changes nothing, when the code is missing or no longer unused.
 */
export async function consumeAccessCodeAndAssignDevices(
  client: Pick<PrismaClient, '$transaction'>,
  input: {
    id: number
    status: 'redeemed' | 'already_entitled'
    usedBy: string
    usedAt: Date
  },
): Promise<boolean> {
  const result = await client.$transaction(async (tx) => {
    const { count } = await tx.trialRedeemCode.updateMany({
      where: { id: input.id, status: 'unused' },
      data: {
        status: input.status,
        usedAt: input.usedAt,
        usedBy: input.usedBy,
      },
    })
    if (count === 0) return null

    const devices = await tx.device.updateManyAndReturn({
      where: { accessCodeId: input.id, userId: null, deletedAt: null },
      data: { userId: input.usedBy },
      select: { id: true, deviceId: true },
    })
    // Every linked Device gets the owner, but only one with a headset bound
    // counts as paired. An unpaired one reports when its owner pairs it.
    return devices
      .filter((device) => device.deviceId != null)
      .map((device) => device.id)
  })

  if (!result) return false
  notifyOwned({ userId: input.usedBy, deviceRecordIds: result })
  return true
}
