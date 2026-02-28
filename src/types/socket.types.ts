/**
 * Socket.IO Event Types
 * Định nghĩa payload types cho tất cả socket events
 * Dùng chung cho admin dashboard
 */

// ── Event Name Constants ──────────────────────
export const SOCKET_EVENTS = {
  ORDER_NEW: 'order:new',
  ORDER_STATUS_UPDATED: 'order:statusUpdated',
  ORDER_PAYMENT_UPDATED: 'order:paymentUpdated',
  ORDER_CANCELLED: 'order:cancelled',
  ORDER_MARK_PAID: 'order:markPaid',
  NOTIFICATION_NEW: 'notification:new'
} as const

// ── Event Payload Types ───────────────────────

/** Đơn hàng mới (admin nhận) */
export interface OrderNewPayload {
  orderId: number
  orderCode: string
  userId: number
  userName: string
  totalPrice: number
  itemCount: number
  createdAt: string
}

/** Trạng thái đơn hàng thay đổi */
export interface OrderStatusUpdatedPayload {
  orderId: number
  orderCode: string
  fromStatus: string
  toStatus: string
  statusName?: string
  updatedBy?: number
}

/** Trạng thái thanh toán thay đổi */
export interface OrderPaymentUpdatedPayload {
  orderId: number
  orderCode: string
  fromPaymentStatus: string
  toPaymentStatus: string
  paymentStatusName?: string
  updatedBy?: number
}

/** Đơn hàng bị hủy */
export interface OrderCancelledPayload {
  orderId: number
  orderCode: string
  cancelledBy: 'admin' | 'user'
  cancelledById: number
}

/** Xác nhận thanh toán thành công */
export interface OrderMarkPaidPayload {
  orderId: number
  orderCode: string
  totalPrice?: number
  confirmedBy?: number
}

/** Notification mới */
export interface NotificationNewPayload {
  id: number
  type: string
  message: string
  isRead: boolean
  createdAt: string
}
