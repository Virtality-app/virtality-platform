export type DeviceVideoErrorCode =
  | 'INVALID_REQUEST'
  | 'UNPAIRED'
  | 'VIDEO_UNAVAILABLE'

export class DeviceVideoRouteError extends Error {
  readonly status: 400 | 404
  readonly code: DeviceVideoErrorCode

  constructor(status: 400 | 404, code: DeviceVideoErrorCode, message: string) {
    super(message)
    this.name = 'DeviceVideoRouteError'
    this.status = status
    this.code = code
  }
}

export function unpairedHeadsetError(): DeviceVideoRouteError {
  return new DeviceVideoRouteError(404, 'UNPAIRED', 'Headset is not paired.')
}

export function videoUnavailableError(): DeviceVideoRouteError {
  return new DeviceVideoRouteError(
    404,
    'VIDEO_UNAVAILABLE',
    'Video is not available.',
  )
}
