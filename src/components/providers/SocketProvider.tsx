'use client'

/**
 * Socket.IO Provider cho Admin Dashboard
 * - Tự động kết nối khi admin đã đăng nhập
 * - Tự động ngắt kết nối khi logout
 * - Refresh access token trước khi connect và khi token expired
 * - Lắng nghe order events và hiển thị toast notification
 * - Tự động refresh danh sách đơn hàng khi có thay đổi
 */

import { createContext, useContext, useEffect, useRef, useCallback, useState, type ReactNode } from 'react'

import axios from 'axios'
import { io, type Socket } from 'socket.io-client'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'

import type { RootState, AppDispatch } from '@/redux/store'
import { fetchOrders } from '@/redux/slices/orderSlice'
import { addRealtimeNotification, clearNotifications } from '@/redux/slices/notificationSlice'
import { ORDER_STATUS_NAMES } from '@/constants/order'
import {
  SOCKET_EVENTS,
  type OrderNewPayload,
  type OrderStatusUpdatedPayload,
  type OrderPaymentUpdatedPayload,
  type OrderCancelledPayload,
  type OrderMarkPaidPayload,
  type NotificationNewPayload
} from '@/types/socket.types'

// ── URLs ──────────────────────────────────────
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8017/V1'
const SOCKET_URL = API_BASE_URL.replace('/V1', '')

// ── Context ───────────────────────────────────
interface SocketContextValue {
  socket: Socket | null
  isConnected: boolean

  /** Số đơn hàng mới chưa xem (reset khi vào trang orders) */
  newOrderCount: number
  resetNewOrderCount: () => void
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  newOrderCount: 0,
  resetNewOrderCount: () => {}
})

export const useSocket = () => useContext(SocketContext)

/**
 * Gọi refresh-token API để lấy access token mới
 * Trả về access token string nếu thành công, null nếu thất bại
 */
const fetchFreshAccessToken = async (): Promise<string | null> => {
  try {
    const res = await axios.post(`${API_BASE_URL}/users/refresh-token`, {}, { withCredentials: true })

    return res.data?.data?.accessToken || null
  } catch {
    return null
  }
}

// ── Provider ──────────────────────────────────
export function SocketProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<Socket | null>(null)
  const retryCountRef = useRef(0)
  const maxRetries = 3
  const dispatch = useDispatch<AppDispatch>()
  const [newOrderCount, setNewOrderCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)

  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  const resetNewOrderCount = useCallback(() => {
    setNewOrderCount(0)
  }, [])

  /**
   * Đơn hàng mới được tạo bởi client
   */
  const handleNewOrder = useCallback(
    (_data: OrderNewPayload) => {
      setNewOrderCount(prev => prev + 1)

      // Không hiển thị toast ở đây — toast được xử lý tập trung bởi NOTIFICATION_NEW handler
      // Chỉ refresh danh sách đơn hàng
      dispatch(fetchOrders({}))
    },
    [dispatch]
  )

  /**
   * Trạng thái đơn hàng được cập nhật (bởi admin khác)
   */
  const handleOrderStatusUpdated = useCallback(
    (data: OrderStatusUpdatedPayload) => {
      const fromLabel = ORDER_STATUS_NAMES[data.fromStatus as keyof typeof ORDER_STATUS_NAMES] ?? data.fromStatus
      const toLabel = ORDER_STATUS_NAMES[data.toStatus as keyof typeof ORDER_STATUS_NAMES] ?? data.toStatus

      toast(`Đơn #${data.orderCode}: ${fromLabel} → ${toLabel}`, {
        icon: '📦',
        duration: 4000
      })

      dispatch(fetchOrders({}))
    },
    [dispatch]
  )

  /**
   * Thanh toán được cập nhật
   */
  const handlePaymentUpdated = useCallback(
    (data: OrderPaymentUpdatedPayload) => {
      toast(`Thanh toán đơn #${data.orderCode}: ${data.paymentStatusName || data.toPaymentStatus}`, {
        icon: '💳',
        duration: 4000
      })

      dispatch(fetchOrders({}))
    },
    [dispatch]
  )

  /**
   * Đơn hàng bị hủy
   */
  const handleOrderCancelled = useCallback(
    (_data: OrderCancelledPayload) => {
      // Không hiển thị toast ở đây — toast được xử lý tập trung bởi NOTIFICATION_NEW handler
      // Chỉ refresh danh sách đơn hàng
      dispatch(fetchOrders({}))
    },
    [dispatch]
  )

  /**
   * Xác nhận thanh toán thành công
   */
  const handleMarkPaid = useCallback(
    (data: OrderMarkPaidPayload) => {
      toast.success(`Đơn #${data.orderCode} đã xác nhận thanh toán`, {
        duration: 4000
      })

      dispatch(fetchOrders({}))
    },
    [dispatch]
  )

  /**
   * Thông báo mới từ server (realtime)
   */
  const handleNewNotification = useCallback(
    (data: NotificationNewPayload) => {
      // Thêm vào Redux store (hiển thị trên dropdown)
      dispatch(
        addRealtimeNotification({
          id: data.id,
          userId: 0,
          type: data.type,
          message: data.message,
          isRead: false,
          createdAt: data.createdAt,
          updatedAt: data.createdAt
        })
      )

      // Hiển thị toast
      toast(data.message, { icon: '🔔', duration: 4000 })
    },
    [dispatch]
  )

  useEffect(() => {
    // Chỉ kết nối khi đã đăng nhập
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }

      retryCountRef.current = 0
      setIsConnected(false)

      // Xoá notification state khi logout
      dispatch(clearNotifications())

      return
    }

    // Tránh kết nối lại nếu đã có
    if (socketRef.current?.connected) return

    /**
     * Refresh token trước → kết nối socket → nếu TOKEN_EXPIRED thì refresh và retry
     */
    const connectSocket = async () => {
      // Lấy access token mới qua refresh endpoint
      const freshToken = await fetchFreshAccessToken()

      // Nếu đã bị disconnect trong lúc chờ refresh, bỏ qua
      if (socketRef.current?.connected) return

      // Nếu không lấy được token → không kết nối
      if (!freshToken) {
        // eslint-disable-next-line no-console
        console.warn('[Socket] Không lấy được access token, bỏ qua kết nối')

        return
      }

      const socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        autoConnect: true,

        // Truyền token trực tiếp qua auth (không phụ thuộc cookie trong WS handshake)
        auth: { token: freshToken },

        // Tắt auto reconnect mặc định, tự xử lý retry với refresh token
        reconnection: false
      })

      // ── Connection events ──
      socket.on('connect', () => {
        retryCountRef.current = 0
        setIsConnected(true)
        // eslint-disable-next-line no-console
        console.log('[Socket] Admin connected:', socket.id)
      })

      socket.on('disconnect', reason => {
        setIsConnected(false)
        // eslint-disable-next-line no-console
        console.log('[Socket] Admin disconnected:', reason)

        // Nếu server ngắt, thử reconnect
        if (reason === 'io server disconnect' || reason === 'transport close') {
          setTimeout(() => {
            if (retryCountRef.current < maxRetries) {
              retryCountRef.current++
              // eslint-disable-next-line no-console
              console.log(`[Socket] Admin reconnecting... (${retryCountRef.current}/${maxRetries})`)
              connectSocket()
            }
          }, 2000)
        }
      })

      socket.on('connect_error', async err => {
        // eslint-disable-next-line no-console
        console.error('[Socket] Admin connection error:', err.message)

        // Token hết hạn → refresh rồi thử lại
        if (err.message === 'TOKEN_EXPIRED' && retryCountRef.current < maxRetries) {
          retryCountRef.current++
          // eslint-disable-next-line no-console
          console.log(`[Socket] Token expired, refreshing... (${retryCountRef.current}/${maxRetries})`)

          socket.disconnect()
          socketRef.current = null

          // Retry sẽ gọi lại connectSocket → fetchFreshAccessToken → auth.token mới
          setTimeout(() => connectSocket(), 500)
        }
      })

      // ── Order lifecycle events ──
      socket.on(SOCKET_EVENTS.ORDER_NEW, handleNewOrder)
      socket.on(SOCKET_EVENTS.ORDER_STATUS_UPDATED, handleOrderStatusUpdated)
      socket.on(SOCKET_EVENTS.ORDER_PAYMENT_UPDATED, handlePaymentUpdated)
      socket.on(SOCKET_EVENTS.ORDER_CANCELLED, handleOrderCancelled)
      socket.on(SOCKET_EVENTS.ORDER_MARK_PAID, handleMarkPaid)

      // ── Notification events ──
      socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, handleNewNotification)

      socketRef.current = socket
    }

    connectSocket()

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners()
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [
    isAuthenticated,
    handleNewOrder,
    handleOrderStatusUpdated,
    handlePaymentUpdated,
    handleOrderCancelled,
    handleMarkPaid,
    handleNewNotification
  ])

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        newOrderCount,
        resetNewOrderCount
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}
