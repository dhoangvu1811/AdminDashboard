import { ORDER_STATUS_NAMES } from '@/constants/order'
import type { Order, OrderStatus } from '@/types/order.types'
import type { RevenuePoint } from './types'
import { ORDER_STATUSES } from './types'

const RECENT_DAY_COUNT = 7

export const createStatusCountObject = (): Record<OrderStatus, number> => ({
  PENDING: 0,
  CONFIRMED: 0,
  PROCESSING: 0,
  SHIPPING: 0,
  DELIVERED: 0,
  CANCELLED: 0
})

export const toSafeNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : 0
}

export const formatNumber = (value: unknown): string => {
  return toSafeNumber(value).toLocaleString('vi-VN')
}

export const formatCurrency = (value: unknown): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(
    toSafeNumber(value)
  )
}

export const formatDateTime = (value: string | Date): string => {
  return new Date(value).toLocaleString('vi-VN')
}

const toDateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')

  return `${year}-${month}-${day}`
}

const fromDateKey = (key: string): Date => {
  const [year, month, day] = key.split('-').map(Number)

  return new Date(year, month - 1, day)
}

const buildRecentDateKeys = (days: number): string[] => {
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const keys: string[] = []

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(startOfToday)

    date.setDate(startOfToday.getDate() - offset)
    keys.push(toDateKey(date))
  }

  return keys
}

export const getOrderPayable = (order: Order): number => {
  if (typeof order.totals?.payable === 'number') {
    return toSafeNumber(order.totals.payable)
  }

  if (typeof order.payments?.[0]?.value === 'number') {
    return toSafeNumber(order.payments[0].value)
  }

  return 0
}

export const buildRevenueSeries = (orders: Order[]): RevenuePoint[] => {
  const dayKeys = buildRecentDateKeys(RECENT_DAY_COUNT)

  const bucket: Record<string, number> = dayKeys.reduce<Record<string, number>>((acc, key) => {
    acc[key] = 0

    return acc
  }, {})

  for (const order of orders) {
    const createdKey = toDateKey(new Date(order.createdAt))

    if (createdKey in bucket) {
      bucket[createdKey] += getOrderPayable(order)
    }
  }

  return dayKeys.map(key => {
    const date = fromDateKey(key)

    return {
      key,
      label: date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }),
      value: bucket[key]
    }
  })
}

export const calculateRevenueSummary = (orders: Order[]): { today: number; month: number } => {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()

  let today = 0
  let month = 0

  for (const order of orders) {
    const createdAt = new Date(order.createdAt).getTime()
    const payable = getOrderPayable(order)

    if (createdAt >= startOfMonth) {
      month += payable
    }

    if (createdAt >= startOfToday) {
      today += payable
    }
  }

  return { today, month }
}

export const buildRevenueChartCategories = (points: RevenuePoint[]): string[] => {
  const categories = points.map((item, index) => {
    const label = item?.label

    return typeof label === 'string' && label.trim() ? label : `Ngày ${index + 1}`
  })

  return categories.length > 0 ? categories : ['N/A']
}

export const buildRevenueChartData = (points: RevenuePoint[]): number[] => {
  const data = points.map(item => toSafeNumber(item?.value))

  return data.length > 0 ? data : [0]
}

export const buildOrderStatusCategories = (): string[] => {
  return ORDER_STATUSES.map((status, index) => {
    const label = ORDER_STATUS_NAMES[status]

    return typeof label === 'string' && label.trim() ? label : `Trạng thái ${index + 1}`
  })
}
