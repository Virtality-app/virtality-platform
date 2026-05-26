'use client'

import { useWarmUpSocketOnSignIn } from '@/hooks/use-warm-up-socket-on-sign-in'

/** Mount once under the app root to warm the socket service after OAuth sign-in. */
const SocketWarmUp = () => {
  useWarmUpSocketOnSignIn()
  return null
}

export default SocketWarmUp
