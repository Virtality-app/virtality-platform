'use client'

import { useEffect, useRef } from 'react'
import { authClient } from '@/auth-client'
import { warmUpSocketServer } from '@/lib/warm-up-socket-server'

const PENDING_WARMUP_KEY = 'virtality:pending-socket-warmup'

/** Call before OAuth redirect so warm-up runs when the session is restored. */
export function markPendingSocketWarmUp(): void {
  sessionStorage.setItem(PENDING_WARMUP_KEY, '1')
}

/**
 * Runs {@link warmUpSocketServer} once after sign-in when a pending flag was set
 * (e.g. social OAuth return). Email sign-in calls warm-up directly in onSuccess.
 */
export function useWarmUpSocketOnSignIn(): void {
  const { data, isPending } = authClient.useSession()
  const hasWarmedRef = useRef(false)

  useEffect(() => {
    if (isPending || !data?.user || hasWarmedRef.current) return
    if (sessionStorage.getItem(PENDING_WARMUP_KEY) !== '1') return

    hasWarmedRef.current = true
    sessionStorage.removeItem(PENDING_WARMUP_KEY)
    void warmUpSocketServer()
  }, [isPending, data?.user])
}
