import { prisma } from '@virtality/db'
import { connectSimulatedHeadset } from './headset-connection'
import {
  createHttpClaim,
  createPairingWatcher,
  PAIRING_POLL_MS,
} from './pairing-watcher'

/**
 * Simulated Headset: standalone `vr` peers for a normally-running socket
 * server.
 *
 * - `ROOM_CODE=<deviceId>`: join that already-paired device's room.
 * - No `ROOM_CODE`: pairing mode. Every pairing started from the console's
 *   Devices page is claimed by a new simulated headset, which then joins.
 */

const {
  ROOM_CODE,
  SOCKET_URL = 'http://localhost:8081',
  SERVER_URL = 'http://localhost:8080',
  SIM_IGNORE_VIDEO_STOP,
  SIM_VIDEO_DURATION_SEC,
} = process.env

const ignoreVideoStop = SIM_IGNORE_VIDEO_STOP === '1'
const videoDurationSec = SIM_VIDEO_DURATION_SEC
  ? Number(SIM_VIDEO_DURATION_SEC)
  : undefined
if (videoDurationSec !== undefined && !(videoDurationSec > 0)) {
  throw new Error('SIM_VIDEO_DURATION_SEC must be a positive number of seconds')
}
const headsets: { close(): void }[] = []
let pairingPoller: NodeJS.Timeout | undefined

function connect(roomCode: string) {
  headsets.push(
    connectSimulatedHeadset({
      socketUrl: SOCKET_URL,
      roomCode,
      ignoreVideoStop,
      videoDurationSec,
    }),
  )
}

if (ROOM_CODE) {
  connect(ROOM_CODE)
} else {
  const watcher = createPairingWatcher({
    findPendingPairings: () =>
      prisma.devicePairingAttempt.findMany({
        where: { status: 'PENDING', expiresAt: { gt: new Date() } },
        select: { id: true, code: true },
      }),
    claim: createHttpClaim(SERVER_URL),
    onPaired: connect,
  })

  let polling = false
  pairingPoller = setInterval(() => {
    if (polling) return
    polling = true
    watcher
      .poll()
      .catch((error) => console.error('[sim] pairing poll failed:', error))
      .finally(() => {
        polling = false
      })
  }, PAIRING_POLL_MS)

  console.log(
    '[sim] waiting for pairing: add a device on the Devices page and press Pair',
  )
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    clearInterval(pairingPoller)
    for (const headset of headsets) headset.close()
    void prisma.$disconnect().finally(() => process.exit(0))
  })
}
