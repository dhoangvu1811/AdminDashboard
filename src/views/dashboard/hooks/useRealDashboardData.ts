import { useCallback, useEffect, useState } from 'react'

import { orderService } from '@/services/orderService'
import type { DashboardTopProduct, Order } from '@/types/order.types'
import { ORDER_STATUSES } from '../types'
import type { DashboardData } from '../types'
import { createStatusCountObject, toSafeNumber } from '../utils'

const RECENT_ORDER_LIMIT = 6

const sortOrdersByCreatedAtDesc = (orders: Order[]): Order[] => {
  return [...orders].sort((firstOrder, secondOrder) => {
    const firstCreatedAt = new Date(firstOrder.createdAt).getTime()
    const secondCreatedAt = new Date(secondOrder.createdAt).getTime()

    return secondCreatedAt - firstCreatedAt
  })
}

const toRevenueLabel = (dateKey: string): string => {
  const parsedDate = new Date(`${dateKey}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return dateKey
  }

  return parsedDate.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit'
  })
}

const useRealDashboardData = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadDashboardData = useCallback(async (silent: boolean = false) => {
    if (silent) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    setErrorMessage(null)

    try {
      const summary = await orderService.getDashboardSummary()

      const statusCounts = createStatusCountObject()

      for (const status of ORDER_STATUSES) {
        statusCounts[status] = toSafeNumber(summary?.statusCounts?.[status])
      }

      const recentOrderList = Array.isArray(summary?.recentOrders)
        ? sortOrdersByCreatedAtDesc(summary.recentOrders).slice(0, RECENT_ORDER_LIMIT)
        : []

      const topSellingProducts: DashboardTopProduct[] = Array.isArray(summary?.products?.topSellingProducts)
        ? summary.products.topSellingProducts.map(product => ({
            id: toSafeNumber(product.id),
            name: String(product.name || ''),
            price: toSafeNumber(product.price),
            stock: toSafeNumber(product.stock),
            selled: toSafeNumber(product.selled)
          }))
        : []

      const revenueSeries = Array.isArray(summary?.revenue?.lastSevenDays)
        ? summary.revenue.lastSevenDays.map(point => ({
            key: point.key,
            label: toRevenueLabel(point.key),
            value: toSafeNumber(point.value)
          }))
        : []

      setDashboardData({
        users: {
          total: toSafeNumber(summary?.users?.totalUsers),
          active: toSafeNumber(summary?.users?.activeUsers),
          inactive: toSafeNumber(summary?.users?.inactiveUsers),
          newToday: toSafeNumber(summary?.users?.newUsersToday),
          newMonth: toSafeNumber(summary?.users?.newUsersThisMonth)
        },
        products: {
          total: toSafeNumber(summary?.products?.totalProducts),
          topSelling: topSellingProducts
        },
        orders: {
          total: toSafeNumber(summary?.totalOrders),
          recent: recentOrderList,
          statusCounts
        },
        revenue: {
          today: toSafeNumber(summary?.revenue?.today),
          month: toSafeNumber(summary?.revenue?.month),
          lastSevenDays: revenueSeries
        },
        lastUpdatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error(error)
      setErrorMessage('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void loadDashboardData(false)
  }, [loadDashboardData])

  return {
    dashboardData,
    isLoading,
    isRefreshing,
    errorMessage,
    loadDashboardData
  }
}

export default useRealDashboardData
