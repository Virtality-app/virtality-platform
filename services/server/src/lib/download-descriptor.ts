import { bucketCdnUrl } from '@virtality/shared/utils'
import {
  unpairedHeadsetError,
  videoUnavailableError,
} from './device-video-errors.ts'
import {
  findPairedDeviceByHeadsetIdentity,
  type PairingPrisma,
} from './device-video-pairing.ts'

const SERVABLE_STATES = new Set(['Published', 'Republishing'])

type DescriptorPrisma = PairingPrisma & {
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

/**
 * Integrity is the platform's concern (S3 validated the upload); the headset
 * only checks that it received `sizeBytes`. The checksum stays server-side.
 */
export type DownloadDescriptor = {
  videoId: string
  version: number
  url: string
  sizeBytes: number
}

function isServableVideo(video: {
  state: string
  objectKey: string | null
  checksum: string | null
  sizeBytes: bigint | number | null
}): video is {
  state: string
  objectKey: string
  checksum: string
  sizeBytes: bigint | number
} {
  return (
    SERVABLE_STATES.has(video.state) &&
    video.objectKey != null &&
    video.checksum != null &&
    video.sizeBytes != null
  )
}

/**
 * One object key serves every version of a video, so the CDN URL alone would
 * let CloudFront hand back the previous bytes after a republish. The version
 * in the query string makes each version its own cache entry.
 */
export function descriptorUrl(objectKey: string, version: number): string {
  return `${bucketCdnUrl(objectKey)}?v=${version}`
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
  if (!video || !isServableVideo(video)) {
    throw videoUnavailableError()
  }

  return {
    videoId: video.id,
    version: video.version,
    url: descriptorUrl(video.objectKey, video.version),
    sizeBytes: Number(video.sizeBytes),
  }
}
