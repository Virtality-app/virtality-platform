import { createORPCClient, type ORPCClient } from '@virtality/orpc/client'
import {
  ORPC_PREFIX,
  SERVER_URL,
  SERVER_URL_LOCAL,
  SERVER_URL_STAGING,
} from '@virtality/shared/types'

let clientInstance: ORPCClient | null = null

const env = process.env.NEXT_PUBLIC_ENV || 'development'

const serverBaseUrl =
  env === 'production'
    ? SERVER_URL
    : env === 'preview'
      ? SERVER_URL_STAGING
      : SERVER_URL_LOCAL

const orpcUrl = `${serverBaseUrl}${ORPC_PREFIX}`

export function getConsoleORPCClient(): ORPCClient {
  if (!clientInstance) {
    clientInstance = createORPCClient({
      url: orpcUrl,
      fetch: (request, init) => fetch(request, { ...init, credentials: 'include' }),
    })
  }

  return clientInstance
}

