/**
 * Notification Service
 * Gọi API notification từ Backend
 */

import axiosInstance from '@/libs/api/axiosInstance'
import { API_ENDPOINTS } from '@/libs/api/endpoints'
import type { NotificationListResponse, NotificationFilters } from '@/types/notification.types'

export const notificationService = {
  /**
   * Lấy danh sách thông báo (paginated)
   */
  getMyNotifications: async (params?: NotificationFilters): Promise<NotificationListResponse> => {
    const response = await axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.LIST, { params })

    return response.data.data
  },

  /**
   * Đánh dấu 1 thông báo đã đọc
   */
  markAsRead: async (id: number): Promise<void> => {
    await axiosInstance.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id))
  },

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  markAllAsRead: async (): Promise<void> => {
    await axiosInstance.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ)
  },

  /**
   * Xoá 1 thông báo
   */
  deleteNotification: async (id: number): Promise<void> => {
    await axiosInstance.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id))
  },

  /**
   * Xoá tất cả thông báo đã đọc
   */
  deleteAllRead: async (): Promise<{ deletedCount: number }> => {
    const response = await axiosInstance.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE_READ)

    return response.data.data
  }
}
