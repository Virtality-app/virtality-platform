import { useEffect } from 'react'

/**
 * Keeps the console screen on while a session runs. The browser drops the
 * lock whenever the page is hidden, so it is requested again each time the
 * page becomes visible. A refused lock never blocks treatment.
 */
export function useSessionWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || typeof navigator === 'undefined') return
    if (!('wakeLock' in navigator)) return

    let sentinel: WakeLockSentinel | null = null
    let cancelled = false

    const acquire = async () => {
      if (document.visibilityState !== 'visible') return
      if (sentinel && !sentinel.released) return
      try {
        const lock = await navigator.wakeLock.request('screen')
        if (cancelled) {
          void lock.release()
          return
        }
        sentinel = lock
      } catch {
        // Denied (battery saver, permissions policy): the session carries on.
      }
    }

    const onVisibilityChange = () => {
      void acquire()
    }

    void acquire()
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibilityChange)
      void sentinel?.release()
      sentinel = null
    }
  }, [active])
}
