import { bucketCdnUrl } from '@virtality/shared/utils'
import {
  unpairedHeadsetError,
  videoUnavailableError,
} from './device-video-errors.ts'
import { findPairedDeviceByHeadsetIdentity } from './device-video-pairing.ts'

const SERVABLE_STATES = new Set(['Published', 'Republishing'])

type DescriptorPrisma = {
  device: {
    findFirst: (args: {
      where: { deviceId: string; AND: [{ deletedAt: null }] }
      select: { id: true }
    }) => Promise<{ id: string } | null>
  }
  immersiveVideo: {
    findUnique: (args: { where: { id: string } }) => Promise<{
      id: string
      state: string
      version: number
      objectKey: string | null
      sizeBytes: bigint | number | null
      checksum: string | null
    } | null>
  }
}

export type DownloadDescriptor = {
  videoId: string
  version: number
  url: string
  sizeBytes: number
  checksum: string
}

export async function getDownloadDescriptor(
  prisma: DescriptorPrisma,
  input: { deviceId: string; videoId: string },
): Promise<DownloadDescriptor> {
  const paired = await findPairedDeviceByHeadsetIdentity(prisma, input.deviceId)
  if (!paired) {
    throw unpairedHeadsetError()
  }

  const video = await prisma.immersiveVideo.findUnique({
    where: { id: input.videoId },
  })
  if (
    !video ||
    !SERVABLE_STATES.has(video.state) ||
    video.objectKey == null ||
    video.checksum == null ||
    video.sizeBytes == null
  ) {
    throw videoUnavailableError()
  }

  return {
    videoId: video.id,
    version: video.version,
    url: bucketCdnUrl(video.objectKey),
    sizeBytes: Number(video.sizeBytes),
    checksum: video.checksum,
  }
}
