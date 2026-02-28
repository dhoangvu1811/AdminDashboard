import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'

import { notificationService } from '@/services/notificationService'
import type { Notification, NotificationFilters } from '@/types/notification.types'

// =========================================
// Types
// =========================================
interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  pagination: {
    page: number
    itemsPerPage: number
    totalItems: number
    totalPages: number
  }
  isLoading: boolean
  error: string | null
}

// =========================================
// Initial State
// =========================================
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  pagination: {
    page: 1,
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 0
  },
  isLoading: false,
  error: null
}

// =========================================
// Async Thunks
// =========================================

/**
 * Lấy danh sách thông báo (có phân trang)
 */
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (params: NotificationFilters = {}, { rejectWithValue }) => {
    try {
      const data = await notificationService.getMyNotifications(params)

      return data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }

      return rejectWithValue(err.response?.data?.message || 'Không thể tải thông báo')
    }
  }
)

/**
 * Đánh dấu 1 thông báo đã đọc
 */
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id: number, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(id)

      return id
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }

      return rejectWithValue(err.response?.data?.message || 'Không thể đánh dấu đã đọc')
    }
  }
)

/**
 * Đánh dấu tất cả thông báo đã đọc
 */
export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead()

      return true
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }

      return rejectWithValue(err.response?.data?.message || 'Không thể đánh dấu tất cả đã đọc')
    }
  }
)

/**
 * Xoá 1 thông báo
 */
export const deleteNotification = createAsyncThunk(
  'notifications/deleteOne',
  async (id: number, { rejectWithValue }) => {
    try {
      await notificationService.deleteNotification(id)

      return id
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }

      return rejectWithValue(err.response?.data?.message || 'Không thể xoá thông báo')
    }
  }
)

/**
 * Xoá tất cả thông báo đã đọc
 */
export const deleteAllReadNotifications = createAsyncThunk(
  'notifications/deleteAllRead',
  async (_, { rejectWithValue }) => {
    try {
      const result = await notificationService.deleteAllRead()

      return result
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }

      return rejectWithValue(err.response?.data?.message || 'Không thể xoá thông báo đã đọc')
    }
  }
)

// =========================================
// Slice
// =========================================
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    /**
     * Thêm thông báo realtime từ socket
     */
    addRealtimeNotification: (state, action: PayloadAction<Notification>) => {
      // Thêm vào đầu danh sách
      state.notifications.unshift(action.payload)
      state.unreadCount += 1
      state.pagination.totalItems += 1
    },

    /**
     * Reset state về ban đầu
     */
    clearNotifications: () => initialState
  },
  extraReducers: builder => {
    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false
        state.notifications = action.payload.notifications
        state.unreadCount = action.payload.unreadCount
        state.pagination = {
          page: action.payload.pagination.page,
          itemsPerPage: action.payload.pagination.itemsPerPage,
          totalItems: action.payload.pagination.totalItems,
          totalPages: action.payload.pagination.totalPages
        }
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Mark as read
    builder
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload)

        if (notification && !notification.isRead) {
          notification.isRead = true
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
      })
      .addCase(markNotificationAsRead.rejected, (_, action) => {
        toast.error(action.payload as string)
      })

    // Mark all as read
    builder
      .addCase(markAllNotificationsAsRead.fulfilled, state => {
        state.notifications.forEach(n => {
          n.isRead = true
        })

        state.unreadCount = 0
      })
      .addCase(markAllNotificationsAsRead.rejected, (_, action) => {
        toast.error(action.payload as string)
      })

    // Delete one notification
    builder
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const id = action.payload
        const notification = state.notifications.find(n => n.id === id)

        if (notification) {
          if (!notification.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1)
          }

          state.notifications = state.notifications.filter(n => n.id !== id)
          state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1)
        }

        toast.success('Đã xoá thông báo')
      })
      .addCase(deleteNotification.rejected, (_, action) => {
        toast.error(action.payload as string)
      })

    // Delete all read notifications
    builder
      .addCase(deleteAllReadNotifications.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(n => !n.isRead)
        state.pagination.totalItems = Math.max(0, state.pagination.totalItems - (action.payload?.deletedCount || 0))
        toast.success(`Đã xoá ${action.payload?.deletedCount || 0} thông báo đã đọc`)
      })
      .addCase(deleteAllReadNotifications.rejected, (_, action) => {
        toast.error(action.payload as string)
      })
  }
})

export const { addRealtimeNotification, clearNotifications } = notificationSlice.actions
export default notificationSlice.reducer
