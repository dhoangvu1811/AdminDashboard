/**
 * Notification Types cho Admin Dashboard
 */

export interface Notification {
  id: number
  userId: number
  type: string
  message: string
  isRead: boolean
  createdAt: string
  updatedAt: string
}

export interface NotificationListResponse {
  notifications: Notification[]
  pagination: {
    page: number
    itemsPerPage: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  unreadCount: number
}

export interface NotificationFilters {
  page?: number
  limit?: number
}
