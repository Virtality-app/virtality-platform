import { createORPCClient as _createORPCClient } from '@orpc/client'
import { RPCLink, RPCLinkOptions } from '@orpc/client/fetch'
import type { RouterClient } from '@orpc/server'
import type { Router } from './router.ts'

export type ORPCClient = RouterClient<Router>

export type ORPCClientLink = RPCLinkOptions<Router>

/** 
  Create an oRPC client from a link.
  @param link - The link to create the client from.
  @returns The created client.
**/
export function createORPCClient(link: RPCLinkOptions<any>): ORPCClient {
  return _createORPCClient(new RPCLink(link))
}

export type { RPCLinkOptions } from '@orpc/client/fetch'
export type { Router } from './router.ts'
export type { ImmersiveVideoAdminRow } from './procedures/immersive-video-constants.ts'
export type { AddressablesCatalogRelease } from './procedures/addressables-catalog-service.ts'
export type { ImmersiveVideoConsoleListItem } from './procedures/immersive-video-service.ts'
export type { DeviceVideoListForUserResult } from './procedures/device-video.ts'
export type {
  SessionActivityReport,
  SessionActivityTrendPoint,
  ClinicianActivity,
  PatientActivity,
  SessionLengthBucket,
} from './procedures/adminboard/session-activity-report.ts'
export type {
  SessionLog,
  SessionLogRow,
  SessionSavedFilter,
} from './procedures/adminboard/session-log.ts'
export type {
  SessionType,
  SessionTypeCounts,
} from './procedures/adminboard/session-type.ts'
export type { ProvisionedDeviceListItem } from './procedures/provisioned-device/provisioned-device.ts'
export type { DevicePairingState } from './procedures/device-pairing/device-pairing.ts'
