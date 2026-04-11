import type { Order, OrderStatus, DashboardTopProduct } from '@/types/order.types'

export const ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPING',
  'DELIVERED',
  'CANCELLED'
]

export type RevenuePoint = {
  key: string
  label: string
  value: number
}

export type DashboardData = {
  users: {
    total: number
    active: number
    inactive: number
    newToday: number
    newMonth: number
  }
  products: {
    total: number
    topSelling: DashboardTopProduct[]
  }
  orders: {
    total: number
    recent: Order[]
    statusCounts: Record<OrderStatus, number>
  }
  revenue: {
    today: number
    month: number
    lastSevenDays: RevenuePoint[]
  }
  lastUpdatedAt: string
}
