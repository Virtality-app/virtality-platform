type PairingPrisma = {
  device: {
    findFirst: (args: {
      where: { deviceId: string; AND: [{ deletedAt: null }] }
      select: { id: true }
    }) => Promise<{ id: string } | null>
  }
}

export async function findPairedDeviceByHeadsetIdentity(
  prisma: PairingPrisma,
  deviceId: string,
): Promise<{ id: string } | null> {
  return prisma.device.findFirst({
    where: { deviceId, AND: [{ deletedAt: null }] },
    select: { id: true },
  })
}
