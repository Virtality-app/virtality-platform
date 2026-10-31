import { randomUUID } from 'node:crypto'

/**
 * Plays the headset side of device pairing: every pending attempt started in
 * the console is claimed with a fresh headset id, the way a clinician typing
 * the code into the headset would.
 */

export const PAIRING_POLL_MS = 1_000
/** Leaves the code on screen briefly before the "headset" claims it. */
export const CLAIM_DELAY_MS = 2_000
export const SIM_DEVICE_ID_PREFIX = 'sim-'

export type PendingPairing = { id: string; code: string }

export type ClaimResult = { ok: true } | { ok: false; reason: string }

export type PairingWatcherDeps = {
  findPendingPairings(): Promise<PendingPairing[]>
  claim(pairingCode: string, deviceId: string): Promise<ClaimResult>
  onPaired(deviceId: string): void
  log?: (message: string) => void
  wait?: (ms: number) => Promise<void>
  createDeviceId?: () => string
}

export function createSimDeviceId() {
  return `${SIM_DEVICE_ID_PREFIX}${randomUUID().slice(0, 8)}`
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export function createPairingWatcher({
  findPendingPairings,
  claim,
  onPaired,
  log = console.log,
  wait = sleep,
  createDeviceId = createSimDeviceId,
}: PairingWatcherDeps) {
  const handled = new Set<string>()

  async function pair({ id, code }: PendingPairing) {
    const deviceId = createDeviceId()
    log(`[sim] pairing code ${code} found (attempt ${id})`)
    await wait(CLAIM_DELAY_MS)

    const result = await claim(code, deviceId)
    if (!result.ok) {
      log(`[sim] claiming code ${code} failed: ${result.reason}`)
      return
    }
    log(`[sim] paired code ${code} as ${deviceId}`)
    onPaired(deviceId)
  }

  /** Claims every pending attempt not seen before. Resolves once all are tried. */
  async function poll() {
    const pending = (await findPendingPairings()).filter(
      ({ id }) => !handled.has(id),
    )
    for (const attempt of pending) handled.add(attempt.id)
    await Promise.all(pending.map(pair))
  }

  return { poll }
}

/** Claims through the server's public endpoint, the same one the headset calls. */
export function createHttpClaim(serverUrl: string) {
  return async (
    pairingCode: string,
    deviceId: string,
  ): Promise<ClaimResult> => {
    try {
      const response = await fetch(`${serverUrl}/api/v1/device-pairing/claim`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ pairingCode, deviceId }),
      })
      if (response.ok) return { ok: true }
      return {
        ok: false,
        reason: `${response.status} ${await response.text()}`,
      }
    } catch (error) {
      return { ok: false, reason: String(error) }
    }
  }
}
