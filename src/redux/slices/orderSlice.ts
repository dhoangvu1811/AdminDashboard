import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'

import { orderService } from '@/services/orderService'
import type { Order, OrderLog, OrderFilters, OrderStatus, PaymentStatus } from '@/types/order.types'

// =========================================
// Types
// =========================================
interface OrderState {
  orders: Order[]
  selectedOrder: Order | null
  orderLogs: OrderLog[]
  pagination: {
    page: number
    itemsPerPage: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  filters: OrderFilters
  isLoading: boolean
  isLoadingDetail: boolean
  error: string | null
}

// =========================================
// Initial State
// =========================================

const initialState: OrderState = {
  orders: [],
  selectedOrder: null,
  orderLogs: [],
  pagination: {
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  },
  filters: {},
  isLoading: false,
  isLoadingDetail: false,
  error: null
}

// =========================================
// Async Thunks
// =========================================

/**
 * Fetch all orders with filters
 */
export const fetchOrders = createAsyncThunk(
  'orders/fetchAll',
  async (filters: OrderFilters = {}, { rejectWithValue }) => {
    try {
      const response = await orderService.getAll(filters)

      // Service đã unwrap: response = { orders: [], pagination: {} }
      const pagination = {
        page: response.pagination.page,
        itemsPerPage: response.pagination.itemsPerPage,
        totalItems: response.pagination.total,
        totalPages: response.pagination.totalPages,
        hasNextPage: response.pagination.page < response.pagination.totalPages,
        hasPrevPage: response.pagination.page > 1
      }

      return { orders: response.orders, pagination, filters }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }

      return rejectWithValue(err.response?.data?.message || 'Không thể tải danh sách đơn hàng')
    }
  }
)

/**
 * Fetch order by ID
 */
export const fetchOrderById = createAsyncThunk('orders/fetchById', async (id: number | string, { rejectWithValue }) => {
  try {
    const response = await orderService.getById(id)

    return response
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }

    return rejectWithValue(err.response?.data?.message || 'Không thể tải chi tiết đơn hàng')
  }
})

/**
 * Fetch order logs
 */
export const fetchOrderLogs = createAsyncThunk('orders/fetchLogs', async (id: number | string, { rejectWithValue: _rejectWithValue }) => {
  try {
    const response = await orderService.getLogs(id)

    return response.logs
  } catch (error: unknown) {
    // Silent fail or just empty logs
    return []
  }
})

/**
 * Update order status
 */
export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, status }: { id: number | string; status: OrderStatus }, { rejectWithValue }) => {
    try {
      const response = await orderService.updateStatus(id, status)

      return response
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }

      return rejectWithValue(err.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng')
    }
  }
)

/**
 * Update payment status
 */
export const updatePaymentStatus = createAsyncThunk(
  'orders/updatePaymentStatus',
  async ({ id, status }: { id: number | string; status: PaymentStatus }, { rejectWithValue }) => {
    try {
      const response = await orderService.updatePaymentStatus(id, status)

      return response
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }

      return rejectWithValue(err.response?.data?.message || 'Không thể cập nhật trạng thái thanh toán')
    }
  }
)

/**
 * Mark as paid
 */
export const markOrderPaid = createAsyncThunk('orders/markPaid', async (id: number | string, { rejectWithValue }) => {
  try {
    const response = await orderService.markPaid(id)

    return response
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }

    return rejectWithValue(err.response?.data?.message || 'Không thể xác nhận thanh toán')
  }
})

/**
 * Cancel order
 */
export const cancelOrder = createAsyncThunk('orders/cancel', async (id: number | string, { rejectWithValue }) => {
  try {
    const response = await orderService.cancel(id)

    return response
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }

    return rejectWithValue(err.response?.data?.message || 'Không thể hủy đơn hàng')
  }
})

// =========================================
// Slice
// =========================================

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<OrderFilters>) => {
      state.filters = action.payload
    },
    clearSelectedOrder: state => {
      state.selectedOrder = null
      state.orderLogs = []
    },
    clearError: state => {
      state.error = null
    }
  },
  extraReducers: builder => {
    // Fetch Orders
    builder
      .addCase(fetchOrders.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false
        state.orders = action.payload.orders
        state.pagination = action.payload.pagination
        state.filters = action.payload.filters
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch Details
    builder
      .addCase(fetchOrderById.pending, state => {
        state.isLoadingDetail = true
        state.error = null
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoadingDetail = false
        state.selectedOrder = action.payload

        // Không extract logs từ order response vì thiếu performedBy info
        // Logs sẽ được fetch riêng qua fetchOrderLogs API
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoadingDetail = false
        state.error = action.payload as string
      })

    // Fetch Logs
    builder.addCase(fetchOrderLogs.fulfilled, (state, action) => {
      state.orderLogs = action.payload
    })

    // Update Status
    builder.addCase(updateOrderStatus.fulfilled, (state, action) => {
      const updated = action.payload
      const idx = state.orders.findIndex(o => o.id === updated.id)

      if (idx !== -1) state.orders[idx] = updated
      if (state.selectedOrder?.id === updated.id) state.selectedOrder = updated
      toast.success('Cập nhật trạng thái thành công')
    })

    // Update Payment Status
    builder.addCase(updatePaymentStatus.fulfilled, (state, action) => {
      const updated = action.payload
      const idx = state.orders.findIndex(o => o.id === updated.id)

      if (idx !== -1) state.orders[idx] = updated
      if (state.selectedOrder?.id === updated.id) state.selectedOrder = updated
      toast.success('Cập nhật thanh toán thành công')
    })

    // Mark Paid
    builder.addCase(markOrderPaid.fulfilled, (state, action) => {
      const updated = action.payload
      const idx = state.orders.findIndex(o => o.id === updated.id)

      if (idx !== -1) state.orders[idx] = updated
      if (state.selectedOrder?.id === updated.id) state.selectedOrder = updated
      toast.success('Xác nhận thanh toán thành công')
    })

    // Cancel
    builder.addCase(cancelOrder.fulfilled, (state, action) => {
      const updated = action.payload
      const idx = state.orders.findIndex(o => o.id === updated.id)

      if (idx !== -1) state.orders[idx] = updated
      if (state.selectedOrder?.id === updated.id) state.selectedOrder = updated
      toast.success('Hủy đơn hàng thành công')
    })
  }
})

export const { setFilters, clearSelectedOrder, clearError } = orderSlice.actions
export default orderSlice.reducer
