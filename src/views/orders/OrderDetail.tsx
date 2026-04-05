/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useEffect, useState, useCallback } from 'react'

import { useRouter } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import CircularProgress from '@mui/material/CircularProgress'
import Avatar from '@mui/material/Avatar'
import Timeline from '@mui/lab/Timeline'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import type { SelectChangeEvent } from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'

// Redux Imports
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  fetchOrderById,
  fetchOrderLogs,
  updateOrderStatus,
  updatePaymentStatus,
  markOrderPaid,
  cancelOrder,
  clearSelectedOrder
} from '@/redux/slices/orderSlice'

// import { PAYMENT_STATUS_NAMES, ORDER_STATUS_NAMES, PAYMENT_METHOD_NAMES, statusObj } from '@/constants/order'
import type { OrderStatus, PaymentMethod, PaymentStatus, LogEntry } from '@/types/order.types'
import { PAYMENT_METHOD_NAMES, statusObj, paymentStatusObj } from '@/constants/order'
import { useSocket } from '@/components/providers/SocketProvider'
import {
  SOCKET_EVENTS,
  type OrderStatusUpdatedPayload,
  type OrderPaymentUpdatedPayload,
  type OrderMarkPaidPayload,
  type OrderCancelledPayload
} from '@/types/socket.types'

interface OrderDetailProps {
  id: string
}

const OrderDetail = ({ id }: OrderDetailProps) => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const { selectedOrder, orderLogs, isLoadingDetail, error } = useAppSelector(state => state.orders)
  const { socket } = useSocket()

  const [statusUpdate, setStatusUpdate] = useState<OrderStatus | ''>('')
  const [openStatusDialog, setOpenStatusDialog] = useState(false)
  const [openMarkPaidDialog, setOpenMarkPaidDialog] = useState(false)
  const [openCancelDialog, setOpenCancelDialog] = useState(false)

  // Fetch Data
  useEffect(() => {
    if (id) {
      dispatch(fetchOrderById(id))
      dispatch(fetchOrderLogs(id))
    }

    return () => {
      dispatch(clearSelectedOrder())
    }
  }, [dispatch, id])

  // Lắng nghe socket events để làm mới lịch sử đơn hàng (Fix 3)
  useEffect(() => {
    const currentOrderId = selectedOrder?.id

    if (!socket || !id || !currentOrderId) return

    const refreshLogsIfMatch = (data: { orderId: number }) => {
      if (data.orderId === currentOrderId) {
        dispatch(fetchOrderById(id))
        dispatch(fetchOrderLogs(id))
      }
    }

    const handleOrderStatusUpdated = (data: OrderStatusUpdatedPayload) => {
      refreshLogsIfMatch(data)
    }

    const handleOrderPaymentUpdated = (data: OrderPaymentUpdatedPayload) => {
      refreshLogsIfMatch(data)
    }

    const handleOrderMarkPaid = (data: OrderMarkPaidPayload) => {
      refreshLogsIfMatch(data)
    }

    const handleOrderCancelled = (data: OrderCancelledPayload) => {
      refreshLogsIfMatch(data)
    }

    socket.on(SOCKET_EVENTS.ORDER_STATUS_UPDATED, handleOrderStatusUpdated)
    socket.on(SOCKET_EVENTS.ORDER_PAYMENT_UPDATED, handleOrderPaymentUpdated)
    socket.on(SOCKET_EVENTS.ORDER_MARK_PAID, handleOrderMarkPaid)
    socket.on(SOCKET_EVENTS.ORDER_CANCELLED, handleOrderCancelled)

    return () => {
      socket.off(SOCKET_EVENTS.ORDER_STATUS_UPDATED, handleOrderStatusUpdated)
      socket.off(SOCKET_EVENTS.ORDER_PAYMENT_UPDATED, handleOrderPaymentUpdated)
      socket.off(SOCKET_EVENTS.ORDER_MARK_PAID, handleOrderMarkPaid)
      socket.off(SOCKET_EVENTS.ORDER_CANCELLED, handleOrderCancelled)
    }
  }, [socket, id, selectedOrder?.id, dispatch])

  // Handlers
  const handleStatusChange = (e: SelectChangeEvent) => {
    setStatusUpdate(e.target.value as OrderStatus)
    setOpenStatusDialog(true)
  }

  const confirmStatusUpdate = async () => {
    if (statusUpdate && selectedOrder) {
      await dispatch(updateOrderStatus({ id: selectedOrder.id, status: statusUpdate }))
      setOpenStatusDialog(false)
      setStatusUpdate('')

      // Refresh logs
      dispatch(fetchOrderLogs(selectedOrder.id))
    }
  }

  const handleMarkPaid = () => {
    if (selectedOrder) {
      setOpenMarkPaidDialog(true)
    }
  }

  const confirmMarkPaid = async () => {
    if (selectedOrder) {
      await dispatch(markOrderPaid(selectedOrder.id))
      setOpenMarkPaidDialog(false)
      dispatch(fetchOrderLogs(selectedOrder.id))
    }
  }

  const handleCancelOrder = () => {
    if (selectedOrder) {
      setOpenCancelDialog(true)
    }
  }

  const confirmCancelOrder = async () => {
    if (selectedOrder) {
      await dispatch(cancelOrder(selectedOrder.id))
      setOpenCancelDialog(false)
      dispatch(fetchOrderLogs(selectedOrder.id))
    }
  }

  // Helper: nhãn người thực hiện — phân biệt Admin / Staff / Khách hàng / Hệ thống (Fix 2)
  const getPerformerLabel = useCallback((log: LogEntry): string => {
    if (log.performedByRole === 'user') return 'Khách hàng'

    if (log.performedByRole === 'admin') {
      const roleName = log.performedBy?.role?.toLowerCase()

      if (roleName === 'staff') return 'Nhân viên'

      return 'Quản trị viên'
    }

    return 'Hệ thống'
  }, [])

  // Helper: nhãn tiếng Việt cho action
  const ACTION_LABELS: Record<string, string> = {
    create: 'Tạo đơn hàng',
    updateStatus: 'Cập nhật trạng thái',
    updatePaymentStatus: 'Cập nhật thanh toán',
    markPaid: 'Xác nhận thanh toán',
    cancel: 'Hủy đơn hàng'
  }

  // Helper: màu TimelineDot theo action
  const getActionDotColor = (action: string): 'primary' | 'success' | 'error' | 'warning' | 'info' | 'grey' => {
    switch (action) {
      case 'create':
        return 'primary'
      case 'markPaid':
        return 'success'
      case 'cancel':
        return 'error'
      case 'updateStatus':
        return 'info'
      case 'updatePaymentStatus':
        return 'warning'
      default:
        return 'grey'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return ''

    return new Date(dateString).toLocaleString('vi-VN')
  }

  if (isLoadingDetail) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!selectedOrder) {
    return <Alert severity='error'>Không tìm thấy đơn hàng</Alert>
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} lg={8}>
        <Card>
          <CardHeader
            title={`Đơn hàng #${selectedOrder.orderCode}`}
            subheader={`Đặt ngày: ${formatDate(selectedOrder.createdAt)}`}
            action={
              <Chip
                label={statusObj[selectedOrder.status]?.label}
                color={statusObj[selectedOrder.status]?.color || 'default'}
              />
            }
          />
          <Divider />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sản phẩm</TableCell>
                  <TableCell>Đơn giá</TableCell>
                  <TableCell align='center'>Giảm giá</TableCell>
                  <TableCell>SL</TableCell>
                  <TableCell align='right'>Tổng</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedOrder.items?.map((item, index) => (
                  <TableRow key={item.productId || index}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={item.image} variant='rounded' />
                        <Box>
                          <Typography variant='body2' fontWeight={500}>
                            {item.name}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {item.sku}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        {item.discount > 0 ? (
                          <>
                            <Typography variant='body2' sx={{ textDecoration: 'line-through' }} color='text.secondary'>
                              {formatCurrency(item.unitPrice)}
                            </Typography>
                            <Typography variant='body2' fontWeight={500} color='error'>
                              {formatCurrency(item.unitPrice * (1 - item.discount / 100))}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant='body2'>{formatCurrency(item.unitPrice)}</Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align='center'>
                      {item.discount > 0 ? (
                        <Chip label={`-${item.discount}%`} size='small' color='error' variant='filled' />
                      ) : (
                        <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center' }}>
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell align='right'>{formatCurrency(item.lineTotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Divider />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {/* Empty/Notes */}
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Tạm tính:</Typography>
                  <Typography fontWeight={500}>{formatCurrency(selectedOrder.totals?.subtotal || 0)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Phí vận chuyển:</Typography>
                  <Typography fontWeight={500}>{formatCurrency(selectedOrder.totals?.shippingFee || 0)}</Typography>
                </Box>
                {/* Giảm giá sản phẩm - tính trực tiếp từ items */}
                {(() => {
                  const productDiscount =
                    selectedOrder.items?.reduce(
                      (sum, item) =>
                        sum + (item.discount > 0 ? ((item.unitPrice * item.discount) / 100) * item.quantity : 0),
                      0
                    ) || 0

                  return productDiscount > 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography color='text.secondary' variant='body2'>
                        Giảm giá sản phẩm:
                      </Typography>
                      <Typography fontWeight={500} color='error' variant='body2'>
                        -{formatCurrency(productDiscount)}
                      </Typography>
                    </Box>
                  ) : null
                })()}

                {/* Giảm giá voucher - từng voucher riêng lẻ */}
                {selectedOrder.vouchers && selectedOrder.vouchers.length > 0
                  ? selectedOrder.vouchers.map(voucher => (
                      <Box key={voucher.code} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography color='text.secondary' variant='body2'>
                            Voucher
                          </Typography>
                          <Chip label={voucher.code} size='small' variant='outlined' color='success' />
                        </Box>
                        <Typography fontWeight={500} color='error' variant='body2'>
                          -{formatCurrency(voucher.discountApplied)}
                        </Typography>
                      </Box>
                    ))
                  : // Fallback: không có voucher, hiển thị tổng giảm giá nếu chưa tách được
                    !selectedOrder.items?.some(item => item.discount > 0) &&
                    (selectedOrder.totals?.discount || 0) > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Giảm giá:</Typography>
                        <Typography fontWeight={500} color='error'>
                          -{formatCurrency(selectedOrder.totals?.discount || 0)}
                        </Typography>
                      </Box>
                    )}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='h6'>Tổng cộng:</Typography>
                  <Typography variant='h6' color='primary'>
                    {formatCurrency(selectedOrder.totals?.payable || 0)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Timeline Logs */}
        <Card sx={{ mt: 6 }}>
          <CardHeader title='Lịch sử đơn hàng' />
          <CardContent>
            <Timeline position='right'>
              {orderLogs?.map((log, index) => (
                <TimelineItem key={log.id}>
                  <TimelineOppositeContent color='text.secondary' sx={{ flex: '0 0 140px' }}>
                    {formatDate(log.at)}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color={getActionDotColor(log.action)} />
                    {index < (orderLogs?.length ?? 0) - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent sx={{ pb: 3 }}>
                    {/* Tên hành động */}
                    <Typography fontWeight={600} variant='body1'>
                      {ACTION_LABELS[log.action] ?? log.action}
                    </Typography>

                    {/* Người thực hiện */}
                    <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 0.5 }}>
                      Bởi: <strong>{getPerformerLabel(log)}</strong>
                      {log.performedBy ? ` — ${log.performedBy.displayName}` : ''}
                    </Typography>

                    {/* Chuyển trạng thái đơn hàng */}
                    {(log.fromStatus || log.toStatus) && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mb: 0.5 }}>
                        <Typography variant='caption' color='text.secondary'>
                          Đơn hàng:
                        </Typography>
                        {log.fromStatus && (
                          <Chip
                            label={statusObj[log.fromStatus]?.label ?? log.fromStatus}
                            color={statusObj[log.fromStatus]?.color ?? 'default'}
                            size='small'
                            variant='outlined'
                          />
                        )}
                        {log.fromStatus && log.toStatus && (
                          <Typography variant='caption' color='text.secondary'>
                            →
                          </Typography>
                        )}
                        {log.toStatus && (
                          <Chip
                            label={statusObj[log.toStatus]?.label ?? log.toStatus}
                            color={statusObj[log.toStatus]?.color ?? 'default'}
                            size='small'
                          />
                        )}
                      </Box>
                    )}

                    {/* Chuyển trạng thái thanh toán */}
                    {/* {(log.fromPaymentStatus || log.toPaymentStatus) && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mb: 0.5 }}>
                        <Typography variant='caption' color='text.secondary'>Thanh toán:</Typography>
                        {log.fromPaymentStatus && (
                          <Chip
                            label={paymentStatusObj[log.fromPaymentStatus]?.label ?? log.fromPaymentStatus}
                            color={paymentStatusObj[log.fromPaymentStatus]?.color ?? 'default'}
                            size='small'
                            variant='outlined'
                          />
                        )}
                        {log.fromPaymentStatus && log.toPaymentStatus && (
                          <Typography variant='caption' color='text.secondary'>→</Typography>
                        )}
                        {log.toPaymentStatus && (
                          <Chip
                            label={paymentStatusObj[log.toPaymentStatus]?.label ?? log.toPaymentStatus}
                            color={paymentStatusObj[log.toPaymentStatus]?.color ?? 'default'}
                            size='small'
                          />
                        )}
                      </Box>
                    )} */}

                    {/* Ghi chú */}
                    {log.note && (
                      <Typography variant='body2' color='text.secondary' sx={{ fontStyle: 'italic', mt: 0.25 }}>
                        {log.note}
                      </Typography>
                    )}
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} lg={4}>
        <Card sx={{ mb: 6 }}>
          <CardHeader title='Khách hàng' />
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Avatar sx={{ width: 50, height: 50, mr: 3 }} />
              <Box>
                <Typography variant='h6'>
                  {selectedOrder.user?.name || selectedOrder.shippingAddress?.name || 'Khách'}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  ID: {selectedOrder.userId}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ mr: 2 }}>
                <i className='ri-map-pin-line' />
              </Box>
              <Typography variant='body2'>
                {selectedOrder.shippingAddress
                  ? [
                      selectedOrder.shippingAddress.address,
                      selectedOrder.shippingAddress.district,
                      selectedOrder.shippingAddress.province
                    ]
                      .filter(Boolean)
                      .join(', ')
                  : 'Không có địa chỉ'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ mr: 2 }}>
                <i className='ri-phone-line' />
              </Box>
              <Typography variant='body2'>{selectedOrder.shippingAddress?.phone || 'N/A'}</Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 6 }}>
          <CardHeader
            title='Thanh toán'
            action={
              selectedOrder.payments?.[0]?.status === 'PAID' && (
                <Chip label='Đã thanh toán' color='success' size='small' />
              )
            }
          />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant='subtitle2' color='text.secondary'>
                  Phương thức thanh toán
                </Typography>
                <Typography variant='body1'>
                  {PAYMENT_METHOD_NAMES[selectedOrder.payments?.[0]?.paymentMethod as PaymentMethod] ||
                    selectedOrder.payments?.[0]?.paymentMethod ||
                    'N/A'}
                </Typography>
              </Grid>
            </Grid>
            {selectedOrder.status !== 'CANCELLED' && selectedOrder.payments?.[0]?.status !== 'PAID' && (
              <Button fullWidth variant='contained' onClick={handleMarkPaid}>
                Xác nhận đã thanh toán
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title='Cập nhật trạng thái' />
          <CardContent>
            <FormControl fullWidth size='small' sx={{ mb: 2 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusUpdate || selectedOrder.status}
                label='Trạng thái'
                onChange={handleStatusChange}
                disabled={selectedOrder.status === 'CANCELLED' || selectedOrder.status === 'DELIVERED'}
              >
                {Object.keys(statusObj)
                  .filter(status => status !== 'CANCELLED')
                  .map(status => (
                    <MenuItem key={status} value={status} disabled={status === selectedOrder.status}>
                      {statusObj[status].label}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 2 }}>
              * Lưu ý: Không thể hoàn tác khi đã chuyển sang trạng thái "Đã hủy" hoặc "Đã giao".
            </Typography>
            {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'DELIVERED' && (
              <Button fullWidth variant='outlined' color='error' onClick={handleCancelOrder}>
                Hủy đơn hàng
              </Button>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Confirm Status Dialog */}
      <Dialog
        open={openStatusDialog}
        onClose={() => {
          setOpenStatusDialog(false)
          setStatusUpdate('')
        }}
      >
        <DialogTitle>Xác nhận cập nhật</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng thành "{statusObj[statusUpdate as string]?.label}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenStatusDialog(false)
              setStatusUpdate('')
            }}
          >
            Hủy
          </Button>
          <Button onClick={confirmStatusUpdate} autoFocus>
            Đồng ý
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Mark Paid Dialog */}
      <Dialog open={openMarkPaidDialog} onClose={() => setOpenMarkPaidDialog(false)}>
        <DialogTitle>Xác nhận thanh toán</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Xác nhận đơn hàng <strong>#{selectedOrder.orderCode}</strong> đã được thanh toán thành công? Hành động này
            sẽ cập nhật trạng thái thanh toán thành <strong>Đã thanh toán</strong> và không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMarkPaidDialog(false)}>Hủy</Button>
          <Button onClick={confirmMarkPaid} variant='contained' color='success' autoFocus>
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Cancel Order Dialog */}
      <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}>
        <DialogTitle>Xác nhận hủy đơn hàng</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn hủy đơn hàng <strong>#{selectedOrder.orderCode}</strong>? Hành động này{' '}
            <strong>không thể hoàn tác</strong>.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)}>Quay lại</Button>
          <Button onClick={confirmCancelOrder} variant='contained' color='error' autoFocus>
            Hủy đơn hàng
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default OrderDetail
