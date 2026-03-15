'use client'

/**
 * NotificationDropdown - Component hiển thị dropdown thông báo
 * Sử dụng MUI Popper + Paper + ClickAwayListener (giống UserDropdown)
 */

import { useRef, useState, useEffect, useCallback } from 'react'

import Link from 'next/link'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

// Redux Imports
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from '@/redux/slices/notificationSlice'

import type { Notification } from '@/types/notification.types'

// ── Helpers ────────────────────────────────────

/** Chuyển createdAt thành chuỗi thời gian tương đối */
const timeAgo = (dateStr: string): string => {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'Vừa xong'
  if (diffMin < 60) return `${diffMin} phút trước`
  if (diffHour < 24) return `${diffHour} giờ trước`
  if (diffDay < 30) return `${diffDay} ngày trước`

  return date.toLocaleDateString('vi-VN')
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

const NotificationDropdown = () => {
  // States
  const [open, setOpen] = useState(false)

  // Refs
  const anchorRef = useRef<HTMLButtonElement>(null)

  // Hooks
  const dispatch = useAppDispatch()
  const { notifications, unreadCount, isLoading } = useAppSelector(state => state.notifications)

  // Fetch notifications khi mở dropdown lần đầu
  // Fetch mỗi khi mở dropdown để dữ liệu luôn mới nhất
  useEffect(() => {
    if (open) {
      dispatch(fetchNotifications({ page: 1, limit: 10 }))
    }
  }, [open, dispatch])

  // Toggle dropdown
  const handleToggle = useCallback(() => {
    setOpen(prev => !prev)
  }, [])

  // Đóng dropdown
  const handleClose = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
        return
      }

      setOpen(false)
    },
    [anchorRef]
  )

  // Click vào 1 thông báo → đánh dấu đã đọc
  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      if (!notification.isRead) {
        dispatch(markNotificationAsRead(notification.id))
      }
    },
    [dispatch]
  )

  // Đánh dấu tất cả đã đọc
  const handleMarkAllRead = useCallback(() => {
    dispatch(markAllNotificationsAsRead())
  }, [dispatch])

  // Refresh danh sách
  const handleRefresh = useCallback(() => {
    dispatch(fetchNotifications({ page: 1, limit: 10 }))
  }, [dispatch])

  // Xoá 1 thông báo
  const handleDelete = useCallback(
    (e: React.MouseEvent, id: number) => {
      e.stopPropagation()
      dispatch(deleteNotification(id))
    },
    [dispatch]
  )

  return (
    <>
      {/* Bell Icon Button */}
      <IconButton ref={anchorRef} className='text-textPrimary' onClick={handleToggle}>
        <Badge badgeContent={unreadCount} color='error' max={99}>
          <i className='ri-notification-2-line' />
        </Badge>
      </IconButton>

      {/* Dropdown Panel */}
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[360px] !mbs-4 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade {...TransitionProps} style={{ transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top' }}>
            <Paper className='shadow-lg' elevation={8}>
              <ClickAwayListener onClickAway={handleClose}>
                <Box>
                  {/* Header */}
                  <Box className='flex items-center justify-between pli-4 plb-3'>
                    <Typography variant='h6'>Thông báo</Typography>
                    <Box className='flex items-center gap-2'>
                      {unreadCount > 0 && (
                        <Chip label={`${unreadCount} mới`} size='small' color='error' variant='outlined' />
                      )}
                      <IconButton size='small' onClick={handleRefresh} title='Làm mới'>
                        <i className='ri-refresh-line text-lg' />
                      </IconButton>
                    </Box>
                  </Box>

                  <Divider />

                  {/* Notification List */}
                  <Box className='max-bs-[400px] overflow-auto'>
                    {isLoading && notifications.length === 0 ? (
                      <Box className='flex justify-center items-center pli-4 plb-8'>
                        <CircularProgress size={28} />
                      </Box>
                    ) : notifications.length === 0 ? (
                      <Box className='flex flex-col items-center justify-center pli-4 plb-8'>
                        <i className='ri-notification-off-line text-4xl text-textDisabled mbe-2' />
                        <Typography variant='body2' color='text.secondary'>
                          Không có thông báo nào
                        </Typography>
                      </Box>
                    ) : (
                      notifications.map(notification => (
                        <Box
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className='flex items-start gap-3 pli-4 plb-3 cursor-pointer transition-colors hover:bg-actionHover'
                          sx={{
                            backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                            borderLeft: notification.isRead ? 'none' : '3px solid',
                            borderLeftColor: notification.isRead ? 'transparent' : 'primary.main'
                          }}
                        >
                          {/* Icon */}
                          <Box className='text-xl mbs-0.5'>{getNotificationIcon(notification.type)}</Box>

                          {/* Content */}
                          <Box className='flex-1 min-is-0'>
                            <Typography
                              variant='body2'
                              className='line-clamp-2'
                              sx={{
                                fontWeight: notification.isRead ? 'normal' : 'bold'
                              }}
                            >
                              {notification.message}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {timeAgo(notification.createdAt)}
                            </Typography>
                          </Box>

                          {/* Unread dot + Delete */}
                          <Box className='flex items-center gap-1 mbs-0.5'>
                            {!notification.isRead && (
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  backgroundColor: 'primary.main',
                                  flexShrink: 0
                                }}
                              />
                            )}
                            <IconButton
                              size='small'
                              onClick={e => handleDelete(e, notification.id)}
                              sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: 'error.main' } }}
                            >
                              <i className='ri-close-line text-sm' />
                            </IconButton>
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>

                  <Divider />

                  {/* Footer Actions */}
                  <Box className='flex items-center justify-between pli-4 plb-2'>
                    <Button size='small' onClick={handleMarkAllRead} disabled={unreadCount === 0}>
                      Đánh dấu tất cả đã đọc
                    </Button>
                    <Button size='small' component={Link} href='/notifications' onClick={() => setOpen(false)}>
                      Xem tất cả
                    </Button>
                  </Box>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default NotificationDropdown
