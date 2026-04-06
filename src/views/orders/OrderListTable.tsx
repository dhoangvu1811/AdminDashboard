'use client'

import { useEffect, useState, useCallback } from 'react'

import { useRouter } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'
import Tooltip from '@mui/material/Tooltip'

// Redux Imports
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { fetchOrders } from '@/redux/slices/orderSlice'
import type { OrderFilters, OrderStatus, PaymentStatus } from '@/types/order.types'
import { useDebounce } from '@/hooks'

import { statusObj, paymentStatusObj } from '@/constants/order'

const OrderListTable = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const { orders, pagination, isLoading, error } = useAppSelector(state => state.orders)

  // Filters
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | ''>('')

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Fetch Orders
  const loadOrders = useCallback(() => {
    const filters: OrderFilters = {
      page: page + 1,
      itemsPerPage: rowsPerPage,
      search: debouncedSearch || undefined,
      status: statusFilter || undefined,
      paymentStatus: paymentStatusFilter || undefined
    }

    dispatch(fetchOrders(filters))
  }, [dispatch, page, rowsPerPage, debouncedSearch, statusFilter, paymentStatusFilter])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  // Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
    setPage(0)
  }

  const handleStatusFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setStatusFilter(event.target.value as OrderStatus | '')
    setPage(0)
  }

  const handlePaymentStatusFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setPaymentStatusFilter(event.target.value as PaymentStatus | '')
    setPage(0)
  }

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleViewDetails = (id: number) => {
    router.push(`/orders/${id}`)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleString('vi-VN')
  }

  return (
    <Box>
      <Card>
        <CardHeader
          title='Quản lý đơn hàng'
          action={
            <Button variant='outlined' onClick={loadOrders} startIcon={<i className='ri-refresh-line' />}>
              Làm mới
            </Button>
          }
        />

        {/* Filters */}
        <Box sx={{ p: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size='small'
            placeholder='Tìm mã đơn, tên KH...'
            value={search}
            onChange={handleSearchChange}
            sx={{ minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='ri-search-line' />
                </InputAdornment>
              )
            }}
          />
          <FormControl size='small' sx={{ minWidth: 200 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusFilter}
              label='Trạng thái'
              onChange={e => handleStatusFilterChange(e as React.ChangeEvent<{ value: unknown }>)}
            >
              <MenuItem value=''>Tất cả</MenuItem>
              {Object.keys(statusObj).map(status => (
                <MenuItem key={status} value={status}>
                  {statusObj[status].label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size='small' sx={{ minWidth: 200 }}>
            <InputLabel>Thanh toán</InputLabel>
            <Select
              value={paymentStatusFilter}
              label='Thanh toán'
              onChange={e => handlePaymentStatusFilterChange(e as React.ChangeEvent<{ value: unknown }>)}
            >
              <MenuItem value=''>Tất cả</MenuItem>
              {Object.keys(paymentStatusObj).map(status => (
                <MenuItem key={status} value={status}>
                  {paymentStatusObj[status].label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Table */}
        {isLoading && orders.length > 0 && <LinearProgress />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã đơn</TableCell>
                <TableCell>Khách hàng</TableCell>
                <TableCell>Ngày đặt</TableCell>
                <TableCell>Tổng tiền</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Thanh toán</TableCell>
                <TableCell align='right'>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align='center' sx={{ py: 10 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align='center' sx={{ py: 10 }}>
                    <Typography color='text.secondary'>{error || 'Không có đơn hàng nào'}</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map(order => (
                  <TableRow key={order.id} hover>
                    <TableCell>
                      <Typography fontWeight={500} color='primary.main'>
                        #{order.orderCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        {order.shippingAddress ? (
                          <>
                            <Typography variant='body2' fontWeight={500}>
                              {order.shippingAddress.name}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {order.shippingAddress.phone}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant='body2' color='text.secondary'>
                            Khách vãng lai
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <Typography fontWeight={500}>{formatCurrency(order.totals.payable)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusObj[order.status]?.label || order.status}
                        color={statusObj[order.status]?.color || 'default'}
                        size='small'
                        variant='outlined'
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={paymentStatusObj[order.payments?.[0]?.status || 'PENDING']?.label}
                        color={paymentStatusObj[order.payments?.[0]?.status || 'PENDING']?.color}
                        size='small'
                      />
                    </TableCell>
                    <TableCell align='right'>
                      <Tooltip title='Xem chi tiết'>
                        <IconButton onClick={() => handleViewDetails(order.id)}>
                          <i className='ri-eye-line' />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component='div'
          count={pagination.totalItems}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage='Số dòng:'
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Card>
    </Box>
  )
}

export default OrderListTable
