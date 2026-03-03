import { RPCHandler } from '@orpc/server/fetch'
import { onError } from '@orpc/server'
import { router } from './router.ts'

export const orpcHandler = new RPCHandler(router, {
  plugins: [],
  interceptors: [
    onError((error: unknown) => {
      console.error('oRPC error:', error)
    }),
  ],
})
