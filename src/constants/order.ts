
import type { OrderStatus, PaymentStatus, PaymentMethod } from '@/types/order.types'

export const ORDER_STATUS_NAMES: Record<OrderStatus, string> = {
  PENDING: 'Chờ xử lý',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang xử lý',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy'
}

export const PAYMENT_STATUS_NAMES: Record<PaymentStatus, string> = {
  PENDING: 'Chờ thanh toán',
  PROCESSING: 'Đang xử lý',
  PAID: 'Đã thanh toán',
  FAILED: 'Thất bại',
  REFUNDED: 'Hoàn tiền',
  CANCELLED: 'Đã hủy'
}

export const PAYMENT_METHOD_NAMES: Record<PaymentMethod, string> = {
  COD: 'Thanh toán khi nhận hàng',
  BANK_TRANSFER: 'Chuyển khoản',
  MOMO: 'Ví MoMo',
  VNPAY: 'VNPay',
  ZALOPAY: 'ZaloPay'
}

export const statusObj: Record<
  string,
  { label: string; color: 'success' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'default' }
> = {
  PENDING: { label: 'Chờ xử lý', color: 'warning' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'info' },
  PROCESSING: { label: 'Đang xử lý', color: 'primary' },
  SHIPPING: { label: 'Đang giao', color: 'secondary' },
  DELIVERED: { label: 'Đã giao', color: 'success' },
  CANCELLED: { label: 'Đã hủy', color: 'error' }
}

export const paymentStatusObj: Record<
  string,
  { label: string; color: 'success' | 'warning' | 'error' | 'default' }
> = {
  PENDING: { label: 'Chờ thanh toán', color: 'warning' },
  PROCESSING: { label: 'Đang xử lý', color: 'warning' },
  PAID: { label: 'Đã thanh toán', color: 'success' },
  FAILED: { label: 'Thất bại', color: 'error' },
  REFUNDED: { label: 'Hoàn tiền', color: 'default' },
  CANCELLED: { label: 'Đã hủy', color: 'error' }
}
