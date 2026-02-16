import type { Metadata } from 'next'

import OrderListTable from '@/views/orders/OrderListTable'

export const metadata: Metadata = {
  title: 'Quản lý đơn hàng',
  description: 'Danh sách đơn hàng trong hệ thống'
}

const OrderListPage = () => {
  return <OrderListTable />
}

export default OrderListPage
