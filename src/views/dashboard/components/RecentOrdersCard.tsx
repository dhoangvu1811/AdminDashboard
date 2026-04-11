import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

import { paymentStatusObj, statusObj } from '@/constants/order'
import type { Order } from '@/types/order.types'
import { formatCurrency, formatDateTime, getOrderPayable } from '../utils'

type RecentOrdersCardProps = {
  orders: Order[]
}

type ChipStatusColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'

const getOrderStatusMeta = (statusValue: string | undefined) => {
  const key = String(statusValue || '').toUpperCase()
  const matched = statusObj[key]

  return {
    label: matched?.label || key || 'Không xác định',
    color: (matched?.color || 'default') as ChipStatusColor
  }
}

const getPaymentStatusMeta = (statusValue: string | undefined) => {
  const key = String(statusValue || '').toUpperCase()
  const matched = paymentStatusObj[key]

  return {
    label: matched?.label || key || 'Không xác định',
    color: (matched?.color || 'default') as ChipStatusColor
  }
}

const RecentOrdersCard = ({ orders }: RecentOrdersCardProps) => {
  return (
    <Grid item xs={12} lg={7}>
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 2 }}>
            <Typography variant='h6'>Đơn hàng gần đây</Typography>
            <Button size='small' variant='text' href='/orders'>
              Xem tất cả
            </Button>
          </Stack>

          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size='small' sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Mã đơn</TableCell>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Tổng tiền</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align='center'>
                      <Typography color='text.secondary'>Chưa có đơn hàng nào.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map(order => {
                    const orderStatus = getOrderStatusMeta(order.status)
                    const paymentStatus = getPaymentStatusMeta(order.payments?.[0]?.status || order.paymentStatus)

                    return (
                      <TableRow key={order.id} hover>
                        <TableCell>
                          <Typography color='primary.main' fontWeight={600}>
                            #{order.orderCode}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant='body2' fontWeight={500}>
                            {order.shippingAddress?.name || 'Khách vãng lai'}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {order.shippingAddress?.phone || 'Không có số điện thoại'}
                          </Typography>
                        </TableCell>

                        <TableCell>{formatCurrency(getOrderPayable(order))}</TableCell>

                        <TableCell sx={{ minWidth: { xs: 190, md: 240 } }}>
                          <Stack spacing={1}>
                            <Stack direction='row' spacing={1} alignItems='center'>
                              <Typography variant='caption' color='text.secondary' sx={{ minWidth: 72 }}>
                                Đơn hàng
                              </Typography>
                              <Chip size='small' variant='tonal' label={orderStatus.label} color={orderStatus.color} />
                            </Stack>

                            <Stack direction='row' spacing={1} alignItems='center'>
                              <Typography variant='caption' color='text.secondary' sx={{ minWidth: 72 }}>
                                Thanh toán
                              </Typography>
                              <Chip
                                size='small'
                                variant='outlined'
                                label={paymentStatus.label}
                                color={paymentStatus.color}
                              />
                            </Stack>
                          </Stack>
                        </TableCell>

                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(order.createdAt)}</TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Grid>
  )
}

export default RecentOrdersCard
