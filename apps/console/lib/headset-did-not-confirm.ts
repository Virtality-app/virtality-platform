import i18next from '@/i18n/i18next'

export type HeadsetDidNotConfirmReason = 'didnt-respond' | 'disconnected'

export type HeadsetDidNotConfirmIntent = 'download' | 'play' | 'stop'

const COPY_KEY: Record<
  HeadsetDidNotConfirmIntent,
  Record<HeadsetDidNotConfirmReason, string>
> = {
  download: {
    'didnt-respond': 'headsetDialog.didntRespond',
    disconnected: 'headsetDialog.downloadDisconnected',
  },
  play: {
    'didnt-respond': 'headsetDialog.didntRespond',
    disconnected: 'headsetDialog.playDisconnected',
  },
  stop: {
    'didnt-respond': 'headsetDialog.stopDidntRespond',
    disconnected: 'headsetDialog.stopDisconnected',
  },
}

export function headsetDidNotConfirmCopy(
  intent: HeadsetDidNotConfirmIntent,
  reason: HeadsetDidNotConfirmReason,
): string {
  return i18next.t(COPY_KEY[intent][reason])
}
