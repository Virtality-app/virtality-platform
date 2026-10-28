'use client'
import { io, SocketOptions, ManagerOptions } from 'socket.io-client'
import { SocketWithQuery } from './types/models'
import { getSocketUrl } from '@virtality/shared/types'

const connectionURL = getSocketUrl()

const socketOptions = {
  secure: true,
  autoConnect: false,
  reconnectionAttempts: 5,
  query: {
    roomCode: '',
    role: 'console',
  },
} satisfies Partial<ManagerOptions & SocketOptions>

export function createSocket(): SocketWithQuery {
  const socket = io(connectionURL, {
    ...socketOptions,
  })

  return socket as SocketWithQuery
}
