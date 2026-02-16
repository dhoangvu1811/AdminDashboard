import OrderDetail from '@/views/orders/OrderDetail'

interface Props {
  params: { id: string }
}

const OrderDetailPage = ({ params }: Props) => {
  return <OrderDetail id={params.id} />
}

export default OrderDetailPage
