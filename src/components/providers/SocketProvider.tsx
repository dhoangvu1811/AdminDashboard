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

import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { fetchOrders } from '@/redux/slices/orderSlice'
import { addRealtimeNotification, clearNotifications, fetchNotifications } from '@/redux/slices/notificationSlice'
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
  const isConnectingRef = useRef(false)
  const ordersRefreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const maxRetries = 3
  const dispatch = useAppDispatch()
  const [newOrderCount, setNewOrderCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)

  const { isAuthenticated } = useAppSelector(state => state.auth)

  const resetNewOrderCount = useCallback(() => {
    setNewOrderCount(0)
  }, [])

  const scheduleOrdersRefresh = useCallback(() => {
    if (ordersRefreshTimerRef.current) clearTimeout(ordersRefreshTimerRef.current)

    ordersRefreshTimerRef.current = setTimeout(() => {
      ordersRefreshTimerRef.current = null
      dispatch(fetchOrders({}))
    }, 300)
  }, [dispatch])

  /**
   * Đơn hàng mới được tạo bởi client
   */
  const handleNewOrder = useCallback(
    (_data: OrderNewPayload) => {
      setNewOrderCount(prev => prev + 1)

      // Fallback: đồng bộ nhanh notification khi có ORDER_NEW,
      // tránh phụ thuộc duy nhất vào event NOTIFICATION_NEW.
      scheduleOrdersRefresh()
      dispatch(fetchNotifications({ page: 1, limit: 20 }))
    },
    [dispatch, scheduleOrdersRefresh]
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

      scheduleOrdersRefresh()
    },
    [scheduleOrdersRefresh]
  )

  /**
   * Thanh toán được cập nhật
   */
  const handlePaymentUpdated = useCallback(
    (data: OrderPaymentUpdatedPayload) => {
      // Khi user thanh toán PayPal thành công, backend gửi cả ORDER_PAYMENT_UPDATED
      // và NOTIFICATION_NEW. Toast ở đây sẽ bị trùng với NOTIFICATION_NEW.
      if (String(data.toPaymentStatus || '').toUpperCase() === 'PAID') {
        scheduleOrdersRefresh()

        return
      }

      toast(`Thanh toán đơn #${data.orderCode}: ${data.paymentStatusName || data.toPaymentStatus}`, {
        icon: '💳',
        duration: 4000
      })

      scheduleOrdersRefresh()
    },
    [scheduleOrdersRefresh]
  )

  /**
   * Đơn hàng bị hủy
   */
  const handleOrderCancelled = useCallback(
    (_data: OrderCancelledPayload) => {
      // Không hiển thị toast ở đây — toast được xử lý tập trung bởi NOTIFICATION_NEW handler
      // Chỉ refresh danh sách đơn hàng
      scheduleOrdersRefresh()
    },
    [scheduleOrdersRefresh]
  )

  /**
   * Xác nhận thanh toán thành công
   */
  const handleMarkPaid = useCallback(
    (data: OrderMarkPaidPayload) => {
      toast.success(`Đơn #${data.orderCode} đã xác nhận thanh toán`, {
        duration: 4000
      })

      scheduleOrdersRefresh()
    },
    [scheduleOrdersRefresh]
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

    let isDisposed = false

    /**
     * Refresh token trước → kết nối socket → nếu TOKEN_EXPIRED thì refresh và retry
     */
    const connectSocket = async () => {
      if (isDisposed || document.hidden || isConnectingRef.current || socketRef.current) return

      isConnectingRef.current = true

      try {
        // Lấy access token mới qua refresh endpoint
        const freshToken = await fetchFreshAccessToken()

        // Nếu tab đã ẩn hoặc socket khác kết nối trong lúc refresh, bỏ qua.
        if (isDisposed || document.hidden || socketRef.current) return

        // Nếu không lấy được token → không kết nối
        if (!freshToken) {
          // eslint-disable-next-line no-console
          console.warn('[Socket] Không lấy được access token, bỏ qua kết nối')

          return
        }

        const socket = io(SOCKET_URL, {
          withCredentials: true,
          transports: ['websocket'],
          autoConnect: true,

          // Truyền token trực tiếp qua auth (không phụ thuộc cookie trong WS handshake)
          auth: { token: freshToken },

          // Tắt auto reconnect mặc định, tự xử lý retry với refresh token
          reconnection: false
        })

        socketRef.current = socket

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
            if (socketRef.current === socket) socketRef.current = null
            socket.removeAllListeners()
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
            reconnectTimerRef.current = setTimeout(() => {
              reconnectTimerRef.current = null

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

          socket.removeAllListeners()
          socket.disconnect()
          if (socketRef.current === socket) socketRef.current = null

          // Token hết hạn → refresh rồi thử lại
          if (err.message === 'TOKEN_EXPIRED' && retryCountRef.current < maxRetries) {
            retryCountRef.current++
            // eslint-disable-next-line no-console
            console.log(`[Socket] Token expired, refreshing... (${retryCountRef.current}/${maxRetries})`)

            // Retry sẽ gọi lại connectSocket → fetchFreshAccessToken → auth.token mới
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
            reconnectTimerRef.current = setTimeout(() => {
              reconnectTimerRef.current = null
              connectSocket()
            }, 500)
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
      } finally {
        isConnectingRef.current = false
      }
    }

    connectSocket()

    // Ngắt socket khi tab ẩn → giải phóng compute Render free.
    // Kết nối lại khi tab hiện → trải nghiệm realtime vẫn đảm bảo khi đang dùng.
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current)
          reconnectTimerRef.current = null
        }

        if (socketRef.current) {
          socketRef.current.removeAllListeners()
          socketRef.current.disconnect()
          socketRef.current = null
          setIsConnected(false)
        }
      } else {
        if (!socketRef.current?.connected) {
          connectSocket()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isDisposed = true
      document.removeEventListener('visibilitychange', handleVisibilityChange)

      if (ordersRefreshTimerRef.current) {
        clearTimeout(ordersRefreshTimerRef.current)
        ordersRefreshTimerRef.current = null
      }

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }

      if (socketRef.current) {
        socketRef.current.removeAllListeners()
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [
    dispatch,
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
