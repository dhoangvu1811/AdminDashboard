'use client'

// React Imports
import { useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { toast } from 'react-hot-toast'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import { styled } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

// Hook & Store Imports
import { useAuth } from '@/hooks/useAuth'
import { useAppDispatch } from '@/redux/hooks'
import { fetchMyPermissions } from '@/redux/slices/permissionSlice'

// Styled component for badge content
const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

const UserDropdown = () => {
  // States
  const [open, setOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Refs
  const anchorRef = useRef<HTMLDivElement>(null)

  // Hooks
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user, logout, refreshUser } = useAuth()

  const handleDropdownOpen = () => {
    !open ? setOpen(true) : setOpen(false)
  }

  const handleDropdownClose = (event?: MouseEvent<HTMLLIElement> | (MouseEvent | TouchEvent), url?: string) => {
    if (url) {
      router.push(url)
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      const success = await logout()

      if (success) {
        setOpen(false)
        router.push('/login')
      }
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleRefreshData = async () => {
    try {
      await Promise.all([refreshUser(), dispatch(fetchMyPermissions()).unwrap()])
      toast.success('Đã cập nhật dữ liệu')
    } catch (error) {
      toast.error('Lỗi cập nhật dữ liệu')
    }
  }

  // Get user display info
  const userName = user?.name || 'Người dùng'

  const getRoleDisplayName = () => {
    switch (user?.role?.name) {
      case 'admin':
        return 'Quản trị viên'
      case 'staff':
        return 'Nhân viên'
      default:
        return 'Người dùng'
    }
  }

  const userRole = getRoleDisplayName()
  const userAvatar = user?.avatar || '/images/avatars/1.png'

  return (
    <>
      <Badge
        ref={anchorRef}
        overlap='circular'
        badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className='mis-2'
      >
        <Avatar
          ref={anchorRef}
          alt={userName}
          src={userAvatar}
          onClick={handleDropdownOpen}
          className='cursor-pointer bs-[38px] is-[38px]'
        />
      </Badge>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-4 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper className='shadow-lg'>
              <ClickAwayListener onClickAway={e => handleDropdownClose(e as MouseEvent | TouchEvent)}>
                <MenuList>
                  <div className='flex items-center plb-2 pli-4 gap-2' tabIndex={-1}>
                    <Avatar alt={userName} src={userAvatar} />
                    <div className='flex items-start flex-col'>
                      <Typography className='font-medium' color='text.primary'>
                        {userName}
                      </Typography>
                      <Typography variant='caption'>{userRole}</Typography>
                    </div>
                  </div>
                  <Divider className='mlb-1' />
                  <MenuItem className='gap-3' onClick={e => handleDropdownClose(e, '/account-settings')}>
                    <i className='ri-user-3-line' />
                    <Typography color='text.primary'>Hồ sơ của tôi</Typography>
                  </MenuItem>
                  <MenuItem
                    className='gap-3'
                    onClick={async e => {
                      await handleRefreshData()
                      handleDropdownClose(e)
                    }}
                  >
                    <i className='ri-refresh-line' />
                    <Typography color='text.primary'>Làm mới dữ liệu</Typography>
                  </MenuItem>
                  {/* <MenuItem className='gap-3' onClick={e => handleDropdownClose(e, '/account-settings')}>
                    <i className='ri-settings-4-line' />
                    <Typography color='text.primary'>Cài đặt</Typography>
                  </MenuItem> */}
                  <div className='flex items-center plb-2 pli-4'>
                    <Button
                      fullWidth
                      variant='contained'
                      color='error'
                      size='small'
                      disabled={isLoggingOut}
                      endIcon={
                        isLoggingOut ? (
                          <CircularProgress size={16} color='inherit' />
                        ) : (
                          <i className='ri-logout-box-r-line' />
                        )
                      }
                      onClick={handleLogout}
                      sx={{ '& .MuiButton-endIcon': { marginInlineStart: 1.5 } }}
                    >
                      {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default UserDropdown
