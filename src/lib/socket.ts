import { io, type Socket } from 'socket.io-client'

const SOCKET_URL =
  (import.meta.env.VITE_SOCKET_URL as string | undefined) ??
  (import.meta.env.VITE_API_URL as string | undefined)?.replace('/api/v1', '') ??
  'http://localhost:3001'

let globalSocket: Socket | null = null

/** Returns a singleton Socket.io client authenticated with the access JWT. */
export function getOrCreateSocket(token: string): Socket {
  if (!globalSocket || !globalSocket.connected) {
    globalSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
    })
  }
  return globalSocket
}

export function disconnectSocket() {
  if (globalSocket) {
    globalSocket.disconnect()
    globalSocket = null
  }
}
