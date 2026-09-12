export type HeadsetDidNotConfirmReason = 'didnt-respond' | 'disconnected'

export type HeadsetDidNotConfirmIntent = 'download' | 'play'

const DIDNT_RESPOND =
  "Headset didn't respond. Check it's on and the app is open."

const COPY: Record<
  HeadsetDidNotConfirmIntent,
  Record<HeadsetDidNotConfirmReason, string>
> = {
  download: {
    'didnt-respond': DIDNT_RESPOND,
    disconnected:
      "The headset disconnected before confirming the download. When it reconnects, check the list. If the video isn't downloading, click Download again.",
  },
  play: {
    'didnt-respond': DIDNT_RESPOND,
    disconnected:
      "The headset disconnected before confirming playback. When it reconnects, check the list. If the video isn't playing, press Play again.",
  },
}

export function headsetDidNotConfirmCopy(
  intent: HeadsetDidNotConfirmIntent,
  reason: HeadsetDidNotConfirmReason,
): string {
  return COPY[intent][reason]
}
