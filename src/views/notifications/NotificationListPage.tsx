'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
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
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

// Redux Imports
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllReadNotifications
} from '@/redux/slices/notificationSlice'

import type { Notification } from '@/types/notification.types'

// ── Helpers ────────────────────────────────────

/** Format thời gian */
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)

  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/** Icon theo loại thông báo */
const getNotificationIcon = (type: string): string => {
  switch (type) {
    case 'ORDER_STATUS':
      return '📦'
    case 'ORDER_PAYMENT':
      return '💳'
    case 'ORDER_CANCELLED':
      return '❌'
    case 'ORDER_NEW':
      return '🛒'
    default:
      return '🔔'
  }
}

/** Label đẹp cho loại thông báo */
const getTypeLabel = (type: string): string => {
  switch (type) {
    case 'ORDER_STATUS':
      return 'Trạng thái đơn hàng'
    case 'ORDER_PAYMENT':
      return 'Thanh toán'
    case 'ORDER_CANCELLED':
      return 'Đơn hàng bị huỷ'
    case 'ORDER_NEW':
      return 'Đơn hàng mới'
    default:
      return type
  }
}

/** Màu chip theo loại */
const getTypeColor = (type: string): 'primary' | 'success' | 'error' | 'warning' | 'info' | 'default' => {
  switch (type) {
    case 'ORDER_NEW':
      return 'primary'
    case 'ORDER_PAYMENT':
      return 'info'
    case 'ORDER_CANCELLED':
      return 'error'
    case 'ORDER_STATUS':
      return 'warning'
    default:
      return 'default'
  }
}

const NotificationListPage = () => {
  const dispatch = useAppDispatch()

  const { notifications, pagination, isLoading, unreadCount } = useAppSelector(state => state.notifications)

  // State
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Notification | null>(null)
  const [deleteAllReadDialogOpen, setDeleteAllReadDialogOpen] = useState(false)
  const isClientFilterMode = readFilter !== 'all'

  // Fetch notifications với phân trang server
  const loadAllNotifications = useCallback(() => {
    dispatch(fetchNotifications({ page: page + 1, limit: rowsPerPage }))
  }, [dispatch, page, rowsPerPage])

  // Khi filter theo trạng thái đọc/chưa đọc, tải đầy đủ dữ liệu rồi phân trang ở client
  const loadFilteredNotifications = useCallback(() => {
    const fullLimit = pagination.totalItems > 0 ? pagination.totalItems : rowsPerPage

    dispatch(fetchNotifications({ page: 1, limit: fullLimit }))
  }, [dispatch, pagination.totalItems, rowsPerPage])

  const loadNotifications = useCallback(() => {
    if (isClientFilterMode) {
      loadFilteredNotifications()

      return
    }

    loadAllNotifications()
  }, [isClientFilterMode, loadFilteredNotifications, loadAllNotifications])

  useEffect(() => {
    if (isClientFilterMode) return
    loadAllNotifications()
  }, [isClientFilterMode, loadAllNotifications])

  useEffect(() => {
    if (!isClientFilterMode) return
    loadFilteredNotifications()
  }, [isClientFilterMode, loadFilteredNotifications])

  // Filtered notifications (client-side filter by read status)
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (readFilter === 'read') return n.isRead
      if (readFilter === 'unread') return !n.isRead

      return true
    })
  }, [notifications, readFilter])

  const displayedNotifications = useMemo(() => {
    if (!isClientFilterMode) return filteredNotifications

    const start = page * rowsPerPage

    return filteredNotifications.slice(start, start + rowsPerPage)
  }, [filteredNotifications, isClientFilterMode, page, rowsPerPage])

  const totalCountForView = useMemo(() => {
    return isClientFilterMode ? filteredNotifications.length : pagination.totalItems
  }, [isClientFilterMode, filteredNotifications.length, pagination.totalItems])

  // Đánh dấu đã đọc
  const handleMarkAsRead = (notification: Notification) => {
    if (!notification.isRead) {
      dispatch(markNotificationAsRead(notification.id))
    }
  }

  // Đánh dấu tất cả đã đọc
  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsAsRead())
  }

  // Xoá 1 thông báo - mở dialog
  const handleOpenDelete = (notification: Notification) => {
    setDeleteTarget(notification)
    setDeleteDialogOpen(true)
  }

  // Xác nhận xoá 1
  const handleConfirmDelete = () => {
    if (deleteTarget) {
      dispatch(deleteNotification(deleteTarget.id)).then(() => {
        // Reload nếu danh sách trống sau khi xoá
        if (displayedNotifications.length <= 1 && page > 0) {
          setPage(prev => prev - 1)
        }
      })
    }

    setDeleteDialogOpen(false)
    setDeleteTarget(null)
  }

  // Mở dialog xoá tất cả đã đọc
  const handleOpenDeleteAllRead = () => {
    setDeleteAllReadDialogOpen(true)
  }

  // Xác nhận xoá tất cả đã đọc
  const handleConfirmDeleteAllRead = () => {
    dispatch(deleteAllReadNotifications()).then(() => {
      loadNotifications()
    })

    setDeleteAllReadDialogOpen(false)
  }

  // Pagination
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleReadFilterChange = (value: 'all' | 'read' | 'unread') => {
    setReadFilter(value)
    setPage(0)
  }

  // Đếm đã đọc
  const readCount = useMemo(() => notifications.filter(n => n.isRead).length, [notifications])

  return (
    <Card>
      <CardHeader
        title='Lịch sử thông báo'
        subheader={`${totalCountForView} thông báo · ${unreadCount} chưa đọc`}
        action={
          <Box className='flex items-center gap-2'>
            {/* Filter */}
            <FormControl size='small' sx={{ minWidth: 140 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={readFilter}
                label='Trạng thái'
                onChange={e => handleReadFilterChange(e.target.value as 'all' | 'read' | 'unread')}
              >
                <MenuItem value='all'>Tất cả</MenuItem>
                <MenuItem value='unread'>Chưa đọc</MenuItem>
                <MenuItem value='read'>Đã đọc</MenuItem>
              </Select>
            </FormControl>

            {/* Mark all read */}
            <Tooltip title='Đánh dấu tất cả đã đọc'>
              <span>
                <Button
                  variant='outlined'
                  size='small'
                  startIcon={<i className='ri-check-double-line' />}
                  onClick={handleMarkAllRead}
                  disabled={unreadCount === 0}
                >
                  Đọc tất cả
                </Button>
              </span>
            </Tooltip>

            {/* Delete all read */}
            <Tooltip title='Xoá tất cả thông báo đã đọc'>
              <span>
                <Button
                  variant='outlined'
                  color='error'
                  size='small'
                  startIcon={<i className='ri-delete-bin-line' />}
                  onClick={handleOpenDeleteAllRead}
                  disabled={readCount === 0}
                >
                  Xoá đã đọc
                </Button>
              </span>
            </Tooltip>

            {/* Refresh */}
            <Tooltip title='Làm mới'>
              <IconButton onClick={loadNotifications}>
                <i className='ri-refresh-line' />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />

      {/* Table */}
      {isLoading && notifications.length > 0 && <LinearProgress />}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={50} />
              <TableCell>Loại</TableCell>
              <TableCell>Nội dung</TableCell>
              <TableCell width={180}>Thời gian</TableCell>
              <TableCell width={100}>Trạng thái</TableCell>
              <TableCell width={100} align='center'>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && notifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align='center' sx={{ py: 8 }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : displayedNotifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align='center' sx={{ py: 8 }}>
                  <Box className='flex flex-col items-center'>
                    <i className='ri-notification-off-line text-4xl text-textDisabled mbe-2' />
                    <Typography variant='body2' color='text.secondary'>
                      Không có thông báo nào
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              displayedNotifications.map(notification => (
                <TableRow
                  key={notification.id}
                  hover
                  sx={{
                    backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleMarkAsRead(notification)}
                >
                  {/* Icon */}
                  <TableCell>
                    <Typography fontSize={20}>{getNotificationIcon(notification.type)}</Typography>
                  </TableCell>

                  {/* Loại */}
                  <TableCell>
                    <Chip
                      label={getTypeLabel(notification.type)}
                      size='small'
                      color={getTypeColor(notification.type)}
                      variant='outlined'
                    />
                  </TableCell>

                  {/* Nội dung */}
                  <TableCell>
                    <Typography variant='body2' sx={{ fontWeight: notification.isRead ? 'normal' : 'bold' }}>
                      {notification.message}
                    </Typography>
                  </TableCell>

                  {/* Thời gian */}
                  <TableCell>
                    <Typography variant='caption' color='text.secondary'>
                      {formatDate(notification.createdAt)}
                    </Typography>
                  </TableCell>

                  {/* Trạng thái */}
                  <TableCell>
                    {notification.isRead ? (
                      <Chip label='Đã đọc' size='small' color='default' variant='outlined' />
                    ) : (
                      <Chip label='Chưa đọc' size='small' color='primary' />
                    )}
                  </TableCell>

                  {/* Thao tác */}
                  <TableCell align='center'>
                    <Box className='flex items-center justify-center gap-1'>
                      {!notification.isRead && (
                        <Tooltip title='Đánh dấu đã đọc'>
                          <IconButton
                            size='small'
                            color='primary'
                            onClick={e => {
                              e.stopPropagation()
                              handleMarkAsRead(notification)
                            }}
                          >
                            <i className='ri-check-line text-lg' />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title='Xoá'>
                        <IconButton
                          size='small'
                          color='error'
                          onClick={e => {
                            e.stopPropagation()
                            handleOpenDelete(notification)
                          }}
                        >
                          <i className='ri-delete-bin-line text-lg' />
                        </IconButton>
                      </Tooltip>
                    </Box>
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
        count={totalCountForView}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 20, 50]}
        labelRowsPerPage='Số dòng:'
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
      />

      {/* Dialog xác nhận xoá 1 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Xác nhận xoá</DialogTitle>
        <DialogContent>
          <DialogContentText>Bạn có chắc muốn xoá thông báo này? Hành động không thể hoàn tác.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Huỷ</Button>
          <Button color='error' variant='contained' onClick={handleConfirmDelete}>
            Xoá
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận xoá tất cả đã đọc */}
      <Dialog open={deleteAllReadDialogOpen} onClose={() => setDeleteAllReadDialogOpen(false)}>
        <DialogTitle>Xác nhận xoá thông báo đã đọc</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc muốn xoá tất cả thông báo đã đọc ({readCount} thông báo)? Hành động không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAllReadDialogOpen(false)}>Huỷ</Button>
          <Button color='error' variant='contained' onClick={handleConfirmDeleteAllRead}>
            Xoá tất cả đã đọc
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default NotificationListPage
