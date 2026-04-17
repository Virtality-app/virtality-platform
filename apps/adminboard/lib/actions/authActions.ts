'use server'
import { headers } from 'next/headers'
import { User, Session } from '@virtality/db'
import {
  ORPC_PREFIX,
  SERVER_URL,
  SERVER_URL_LOCAL,
  SERVER_URL_STAGING,
} from '@virtality/shared/types'
import { serverLogger } from '@/lib/server-logger'

const env = process.env.ENV || 'development'
const logger = serverLogger.child({
  component: 'adminboard-auth-actions',
})

const baseURL =
  env === 'production'
    ? SERVER_URL
    : env === 'preview'
      ? SERVER_URL_STAGING
      : SERVER_URL_LOCAL

const me = baseURL + ORPC_PREFIX + '/me'

const fetchOptions: RequestInit = {
  credentials: 'include',
  cache: 'no-store',
}

const fetchUserSession = async () => {
  try {
    const headerStore = await headers()
    const cookie = headerStore.get('cookie') ?? undefined

    if (!cookie) return null

    const res = await fetch(me, {
      ...fetchOptions,
      headers: { cookie },
    })

    if (!res.ok) return null

    const body = await res.json()
    // tRPC response shape: { result: { data: { json: <value> } } }
    const data = (body?.json ?? body) as {
      session: Session
      user: User
    }

    if (!data?.session || !data?.user) return null
    return data
  } catch (error) {
    logger.error(
      'adminboard.auth.fetch_session.failed',
      {
        error,
        baseURL,
      },
      'Failed to fetch adminboard session',
    )
  }
}

export const getUserAndSession = async () => {
  try {
    const data = await fetchUserSession()

    return data
  } catch (error) {
    logger.error(
      'adminboard.auth.get_user_and_session.failed',
      {
        error,
      },
      'Failed to load adminboard user and session',
    )
    throw Error('[Better Auth] Problem with getting User and Session!')
  }
}
