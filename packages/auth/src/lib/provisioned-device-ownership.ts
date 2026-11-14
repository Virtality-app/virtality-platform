import type { PrismaClient } from '@virtality/db'
import { compareHeadsetNames, nextHeadsetNames } from '@virtality/shared/utils'

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
 * redeeming user the owner of every Provisioned Device linked to it, renamed
 * to follow the `Headset-##` Devices the account already has. Returns
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

    const waiting = await tx.device.findMany({
      where: { accessCodeId: input.id, userId: null, deletedAt: null },
      select: { id: true, name: true, deviceId: true },
    })
    if (waiting.length === 0) return []

    // Headset names count per customer: the code's headsets continue after
    // the ones this account already has, in the order they had on the code.
    const owned = await tx.device.findMany({
      where: { userId: input.usedBy, deletedAt: null },
      select: { name: true },
    })
    const arriving = [...waiting].sort((a, b) =>
      compareHeadsetNames(a.name, b.name),
    )
    const names = nextHeadsetNames(
      owned.map((device) => device.name),
      arriving.length,
    )

    const paired: string[] = []
    for (const [i, device] of arriving.entries()) {
      // Guarded, so a headset staff moved off the code meanwhile stays put.
      const { count } = await tx.device.updateMany({
        where: {
          id: device.id,
          accessCodeId: input.id,
          userId: null,
          deletedAt: null,
        },
        data: { userId: input.usedBy, name: names[i] },
      })
      // Every linked Device gets the owner, but only one with a headset bound
      // counts as paired. An unpaired one reports when its owner pairs it.
      if (count > 0 && device.deviceId != null) paired.push(device.id)
    }
    return paired
  })

  if (!result) return false
  notifyOwned({ userId: input.usedBy, deviceRecordIds: result })
  return true
}
