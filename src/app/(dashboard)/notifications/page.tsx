import type { Metadata } from 'next'

import NotificationListPage from '@/views/notifications/NotificationListPage'

export const metadata: Metadata = {
  title: 'Lịch sử thông báo',
  description: 'Quản lý và xem lịch sử thông báo'
}

const NotificationsPage = () => {
  return <NotificationListPage />
}

export default NotificationsPage
