import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

let socketInstance = null

export function getSocket() {
  if (!socketInstance) {
    socketInstance = io('/', { withCredentials: true, autoConnect: false })
  }
  return socketInstance
}

export function useSocket(userId, role) {
  const socketRef = useRef(getSocket())

  useEffect(() => {
    const socket = socketRef.current
    if (!userId) return

    socket.connect()
    if (role === 'customer') socket.emit('join_customer', userId)

    return () => {
      socket.disconnect()
    }
  }, [userId, role])

  return socketRef.current
}

export function useOrderSocket(orderId, onUpdate) {
  useEffect(() => {
    if (!orderId) return
    const socket = getSocket()
    socket.emit('join_order', orderId)
    socket.on('order_updated', onUpdate)
    socket.on('driver_assigned', ({ order }) => onUpdate(order))
    return () => {
      socket.off('order_updated', onUpdate)
      socket.off('driver_assigned')
    }
  }, [orderId, onUpdate])
}
