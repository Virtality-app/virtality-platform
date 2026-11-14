'use client'

import {
  type DevicePairingState,
  useCancelProvisionedDevicePairing,
  useInvalidateProvisionedDevices,
  useProvisionedDevicePairingStatus,
  useStartProvisionedDevicePairing,
} from '@virtality/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getErrorMessage } from '@/lib/get-error-message'
import { secondsUntil } from '@/lib/provisioned-device-display'

type Attempt = {
  attemptId: string
  code: string
  /** Expiry on this machine's clock, corrected for server skew. */
  expiresAt: Date
}

export type StaffPairingPhase =
  | 'starting'
  | 'waiting'
  | 'paired'
  | 'ended'
  | 'failed'

const ENDED_COPY: Partial<Record<DevicePairingState, string>> = {
  expired: 'The code expired before the headset used it.',
  cancelled: 'Pairing was cancelled.',
  superseded: 'This code was replaced or the headset is paired elsewhere.',
}

/**
 * Staff Pairing Claim for one Provisioned Device: starts an attempt, polls
 * it, and counts down to its expiry. Cancels a pending attempt on unmount.
 */
export function useStaffPairing(deviceRecordId: string) {
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(() => new Date())
  const { mutateAsync: startAttempt } = useStartProvisionedDevicePairing()
  const { mutate: cancelAttempt } = useCancelProvisionedDevicePairing()
  const status = useProvisionedDevicePairingStatus(attempt?.attemptId ?? null)
  const state = status.data?.state
  const invalidateDevices = useInvalidateProvisionedDevices()

  // The headset claimed the code: the list should now show it as paired.
  useEffect(() => {
    if (state === 'completed') void invalidateDevices()
    // `invalidateDevices` is a fresh closure each render; run once per state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  const requestCode = useCallback(() => {
    setError(null)
    setAttempt(null)
    // The promise, not mutate's per-call callbacks: TanStack drops those when
    // the observer resubscribes (StrictMode's remount), stranding the code.
    startAttempt({ deviceRecordId })
      .then((started) => {
        const skewMs = Date.now() - new Date(started.serverTime).getTime()
        setAttempt({
          attemptId: started.attemptId,
          code: started.code,
          expiresAt: new Date(new Date(started.expiresAt).getTime() + skewMs),
        })
      })
      .catch((startError: unknown) =>
        setError(getErrorMessage(startError, 'Could not start pairing.')),
      )
  }, [deviceRecordId, startAttempt])

  // Start once per Device. A second start supersedes the first, and the two
  // requests can land in either order, leaving the code on screen dead. The
  // ref survives StrictMode's effect re-run, which would otherwise do that.
  const startedFor = useRef<string | null>(null)
  useEffect(() => {
    if (startedFor.current === deviceRecordId) return
    startedFor.current = deviceRecordId
    requestCode()
  }, [deviceRecordId, requestCode])

  const pending =
    Boolean(attempt) && (state === undefined || state === 'pending')

  useEffect(() => {
    if (!pending) return
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [pending])

  // Leaving the dialog while the code is live frees it for the headset.
  const pendingAttemptId = useRef<string | null>(null)
  useEffect(() => {
    pendingAttemptId.current = pending ? (attempt?.attemptId ?? null) : null
  }, [attempt?.attemptId, pending])
  useEffect(
    () => () => {
      if (pendingAttemptId.current) {
        cancelAttempt({ attemptId: pendingAttemptId.current })
      }
    },
    [cancelAttempt],
  )

  const phase: StaffPairingPhase = error
    ? 'failed'
    : !attempt
      ? 'starting'
      : state === 'completed'
        ? 'paired'
        : state && state !== 'pending'
          ? 'ended'
          : 'waiting'

  return {
    phase,
    code: attempt?.code ?? null,
    secondsLeft: attempt ? secondsUntil(attempt.expiresAt, now) : 0,
    message:
      error ??
      (phase === 'ended' && state ? (ENDED_COPY[state] ?? null) : null),
    requestCode,
  }
}
