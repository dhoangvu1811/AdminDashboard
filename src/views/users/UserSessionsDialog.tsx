'use client'

import { useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'

// Redux Imports
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { fetchUserSessions, revokeSession, revokeAllSessions } from '@/redux/slices/userSlice'
import type { User } from '@/types/auth.types'

interface UserSessionsDialogProps {
  open: boolean
  user: User | null
  onClose: () => void
}

const UserSessionsDialog = ({ open, user, onClose }: UserSessionsDialogProps) => {
  const dispatch = useAppDispatch()
  const { sessions, isLoadingSessions } = useAppSelector(state => state.users)

  useEffect(() => {
    if (open && user) {
      dispatch(fetchUserSessions(user.id))
    }
  }, [open, user, dispatch])

  const handleRevokeSession = async (sessionId: string) => {
    await dispatch(revokeSession({ sessionId }))

    if (user) {
      dispatch(fetchUserSessions(user.id))
    }
  }

  const handleRevokeAll = async () => {
    if (!user) return

    await dispatch(revokeAllSessions(user.id))
    dispatch(fetchUserSessions(user.id))
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'

    return new Date(dateString).toLocaleString('vi-VN')
  }

  const getBrowserInfo = (userAgent: string) => {
    let browser = 'Unknown'
    let os = 'Unknown'

    if (userAgent.includes('Firefox')) browser = 'Firefox'
    else if (userAgent.includes('Chrome')) browser = 'Chrome'
    else if (userAgent.includes('Safari')) browser = 'Safari'
    else if (userAgent.includes('Edge')) browser = 'Edge'
    else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) browser = 'IE'

    if (userAgent.includes('Windows')) os = 'Windows'
    else if (userAgent.includes('Mac')) os = 'MacOS'
    else if (userAgent.includes('Linux')) os = 'Linux'
    else if (userAgent.includes('Android')) os = 'Android'
    else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS'

    return `${browser} on ${os}`
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='lg' fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='h6'>Phiên đăng nhập của {user?.name}</Typography>
          {sessions.length > 0 && (
            <Button
              variant='outlined'
              color='error'
              size='small'
              onClick={handleRevokeAll}
              disabled={isLoadingSessions}
            >
              Thu hồi tất cả
            </Button>
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        {isLoadingSessions ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : sessions.length === 0 ? (
          <Typography color='text.secondary' align='center' sx={{ py: 5 }}>
            Không có phiên đăng nhập nào
          </Typography>
        ) : (
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>ID Phiên</TableCell>
                  <TableCell>Thiết bị</TableCell>
                  <TableCell>IP</TableCell>
                  <TableCell>Đăng nhập lúc</TableCell>
                  <TableCell>Hết hạn/Đăng xuất</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align='right'>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map(session => (
                  <TableRow key={session.sessionId}>
                    <TableCell>
                      <Tooltip title={session.sessionId}>
                        <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
                          {session.sessionId.substring(0, 8)}...
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={session.deviceInfo}>
                        <Typography variant='body2'>{getBrowserInfo(session.deviceInfo)}</Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{session.ipAddress || 'N/A'}</TableCell>
                    <TableCell>{formatDate(session.createdAt)}</TableCell>
                    <TableCell>
                      {session.logoutAt ? (
                        <Typography variant='caption' color='text.secondary'>
                          Logout: {formatDate(session.logoutAt)}
                        </Typography>
                      ) : (
                        <Typography variant='caption' color='text.secondary'>
                          Exp: {formatDate(session.expiresAt)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          session.status === 'active'
                            ? 'Đang hoạt động'
                            : session.status === 'logout'
                              ? 'Đã đăng xuất'
                              : 'Hết hạn'
                        }
                        color={session.status === 'active' ? 'success' : 'default'}
                        size='small'
                        variant='outlined'
                      />
                    </TableCell>
                    <TableCell align='right'>
                      <Tooltip title='Thu hồi phiên'>
                        <span>
                          <IconButton
                            size='small'
                            color='error'
                            onClick={() => handleRevokeSession(session.sessionId)}
                            disabled={isLoadingSessions || session.status !== 'active'}
                          >
                            <i className='ri-logout-box-line' />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  )
}

export default UserSessionsDialog
