import axiosInstance from '@/libs/api/axiosInstance'
import { API_ENDPOINTS } from '@/libs/api/endpoints'
import type {
  Order,
  OrderListResponse,
  OrderLog,
  OrderFilters,
  OrderStatus,
  PaymentStatus,
  OrderDashboardSummary
} from '@/types/order.types'
import type { ApiResponse } from '@/types/api.types'

export const orderService = {
  /**
   * Get all orders with pagination and filters
   */
  getAll: async (params?: OrderFilters) => {
    const response = await axiosInstance.get<OrderListResponse>(API_ENDPOINTS.ORDERS.ALL, {
      params
    })

    return response.data.data
  },

  /**
   * Get aggregated dashboard summary for orders
   */
  getDashboardSummary: async () => {
    const response = await axiosInstance.get<ApiResponse<OrderDashboardSummary>>(API_ENDPOINTS.ORDERS.DASHBOARD_SUMMARY)

    return response.data.data
  },

  /**
   * Get order details by ID
   */
  getById: async (id: number | string) => {
    const response = await axiosInstance.get<ApiResponse<Order>>(API_ENDPOINTS.ORDERS.DETAILS(id))

    return response.data.data
  },

  /**
   * Update order status
   */
  updateStatus: async (id: number | string, status: OrderStatus) => {
    const response = await axiosInstance.put<ApiResponse<Order>>(API_ENDPOINTS.ORDERS.UPDATE_STATUS(id), {
      status
    })

    return response.data.data
  },

  /**
   * Update payment status
   */
  updatePaymentStatus: async (id: number | string, status: PaymentStatus) => {
    const response = await axiosInstance.put<ApiResponse<Order>>(API_ENDPOINTS.ORDERS.UPDATE_PAYMENT(id), {
      status
    })

    return response.data.data
  },

  /**
   * Mark order as paid
   */
  markPaid: async (id: number | string) => {
    const response = await axiosInstance.post<ApiResponse<Order>>(API_ENDPOINTS.ORDERS.MARK_PAID(id))

    return response.data.data
  },

  /**
   * Cancel order
   */
  cancel: async (id: number | string, cancelReason?: string) => {
    const response = await axiosInstance.post<ApiResponse<Order>>(API_ENDPOINTS.ORDERS.CANCEL(id), {
      cancelReason
    })

    return response.data.data
  },

  /**
   * Get order logs
   */
  getLogs: async (id: number | string) => {
    // API returns wrapped: { code, message, data: { orderCode, status, logs } }
    const response = await axiosInstance.get<
      ApiResponse<{
        orderCode: string
        status: OrderStatus
        logs: OrderLog[]
      }>
    >(API_ENDPOINTS.ORDERS.LOGS(id))

    return response.data.data
  }
}
