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
import Avatar from '@mui/material/Avatar'
import Menu from '@mui/material/Menu'
import Checkbox from '@mui/material/Checkbox'
import TablePagination from '@mui/material/TablePagination'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'

// Redux Imports
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { fetchUsers, deleteUser, deleteMultipleUsers, activateUser, deactivateUser } from '@/redux/slices/userSlice'
import { fetchRoles } from '@/redux/slices/roleSlice'
import type { UserFilters } from '@/types/user.types'
import type { User } from '@/types/auth.types'
import { useDebounce } from '@/hooks'

// Dialog Components
import UserEditDialog from './UserEditDialog'
import UserDeleteDialog from './UserDeleteDialog'
import UserRoleDialog from './UserRoleDialog'
import UserSessionsDialog from './UserSessionsDialog'

const UserListPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { users, pagination, isLoading, error } = useAppSelector(state => state.users)
  const { roles } = useAppSelector(state => state.roles)

  // Filter states
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Selection states
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [sessionsDialogOpen, setSessionsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [deleteMultiple, setDeleteMultiple] = useState(false)

  // Action menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [menuUser, setMenuUser] = useState<User | null>(null)

  // Fetch users
  const loadUsers = useCallback(() => {
    const filters: UserFilters = {
      page: page + 1,
      itemsPerPage: rowsPerPage,
      search: debouncedSearch || undefined,
      role: (roleFilter || undefined) as UserFilters['role'],
      status: (statusFilter || undefined) as UserFilters['status']
    }

    dispatch(fetchUsers(filters))
  }, [dispatch, page, rowsPerPage, debouncedSearch, roleFilter, statusFilter])

  useEffect(() => {
    loadUsers()
    dispatch(fetchRoles())
  }, [loadUsers, dispatch])

  // Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
    setPage(0)
  }

  const handleRoleFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setRoleFilter(event.target.value as string)
    setPage(0)
  }

  const handleStatusFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setStatusFilter(event.target.value as string)
    setPage(0)
  }

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Selection handlers
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedUsers(users.map(u => String(u.id)))
    } else {
      setSelectedUsers([])
    }
  }

  const handleSelectUser = (userId: number) => {
    const idStr = String(userId)

    setSelectedUsers(prev => (prev.includes(idStr) ? prev.filter(id => id !== idStr) : [...prev, idStr]))
  }

  // Action menu handlers
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget)
    setMenuUser(user)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setMenuUser(null)
  }

  // Action handlers
  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setEditDialogOpen(true)
    handleCloseMenu()
  }

  const handleDelete = (user: User) => {
    setSelectedUser(user)
    setDeleteMultiple(false)
    setDeleteDialogOpen(true)
    handleCloseMenu()
  }

  const handleBulkDelete = () => {
    setDeleteMultiple(true)
    setDeleteDialogOpen(true)
  }

  const handleChangeRole = (user: User) => {
    setSelectedUser(user)
    setRoleDialogOpen(true)
    handleCloseMenu()
  }

  const handleViewSessions = (user: User) => {
    setSelectedUser(user)
    setSessionsDialogOpen(true)
    handleCloseMenu()
  }

  const handleToggleStatus = async (user: User) => {
    if (user.status === 'active') {
      await dispatch(deactivateUser(user.id))
    } else {
      await dispatch(activateUser(user.id))
    }

    handleCloseMenu()
  }

  // Delete confirmation handler
  const handleConfirmDelete = async () => {
    if (deleteMultiple) {
      await dispatch(deleteMultipleUsers({ userIds: selectedUsers }))
      setSelectedUsers([])
    } else if (selectedUser) {
      await dispatch(deleteUser(selectedUser.id))
    }

    setDeleteDialogOpen(false)
    setSelectedUser(null)
  }

  // Dialog close handlers
  const handleEditDialogClose = () => {
    setEditDialogOpen(false)
    setSelectedUser(null)
  }

  const handleRoleDialogClose = () => {
    setRoleDialogOpen(false)
    setSelectedUser(null)
  }

  const handleSessionsDialogClose = () => {
    setSessionsDialogOpen(false)
    setSelectedUser(null)
  }

  // Get role color
  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'error'
      case 'staff':
        return 'warning'
      case 'user':
        return 'info'
      default:
        return 'default'
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'default'
  }

  return (
    <Box>
      <Card>
        <CardHeader
          title='Quản lý người dùng'
          action={
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant='outlined'
                color='secondary'
                onClick={loadUsers}
                startIcon={<i className='ri-refresh-line' />}
              >
                Làm mới
              </Button>
              {selectedUsers.length > 0 && (
                <Button variant='outlined' color='error' onClick={handleBulkDelete}>
                  Xóa ({selectedUsers.length})
                </Button>
              )}
              <Button
                variant='contained'
                startIcon={<i className='ri-add-line' />}
                onClick={() => router.push('/users/create')}
              >
                Thêm người dùng
              </Button>
            </Box>
          }
        />

        {/* Filters */}
        <Box sx={{ p: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size='small'
            placeholder='Tìm kiếm tên, email...'
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
          <FormControl size='small' sx={{ minWidth: 150 }}>
            <InputLabel>Vai trò</InputLabel>
            <Select
              value={roleFilter}
              label='Vai trò'
              onChange={e => handleRoleFilterChange(e as React.ChangeEvent<{ value: unknown }>)}
            >
              <MenuItem value=''>Tất cả</MenuItem>
              {roles.map(role => (
                <MenuItem key={role.id} value={role.name}>
                  {role.displayName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size='small' sx={{ minWidth: 150 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusFilter}
              label='Trạng thái'
              onChange={e => handleStatusFilterChange(e as React.ChangeEvent<{ value: unknown }>)}
            >
              <MenuItem value=''>Tất cả</MenuItem>
              <MenuItem value='active'>Hoạt động</MenuItem>
              <MenuItem value='inactive'>Đã khóa</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding='checkbox'>
                  <Checkbox
                    checked={users.length > 0 && selectedUsers.length === users.length}
                    indeterminate={selectedUsers.length > 0 && selectedUsers.length < users.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Người dùng</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell align='right'>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align='center' sx={{ py: 10 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align='center' sx={{ py: 10 }}>
                    <Typography color='text.secondary'>{error || 'Không có người dùng nào'}</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map(user => (
                  <TableRow key={user.id} hover>
                    <TableCell padding='checkbox'>
                      <Checkbox
                        checked={selectedUsers.includes(String(user.id))}
                        onChange={() => handleSelectUser(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={user.avatar || undefined} alt={user.name}>
                          {user.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography fontWeight={500}>{user.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role?.displayName || user.role?.name || 'Không xác định'}
                        color={getRoleColor(user.role?.name || 'user')}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                        color={getStatusColor(user.status)}
                        size='small'
                        variant='outlined'
                      />
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell align='right'>
                      <Tooltip title='Thao tác'>
                        <IconButton onClick={e => handleOpenMenu(e, user)}>
                          <i className='ri-more-2-fill' />
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
          count={pagination?.total || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage='Số dòng:'
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Card>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem onClick={() => menuUser && handleEdit(menuUser)}>
          <i className='ri-edit-line' style={{ marginRight: 8 }} />
          Chỉnh sửa
        </MenuItem>
        <MenuItem onClick={() => menuUser && handleChangeRole(menuUser)}>
          <i className='ri-user-settings-line' style={{ marginRight: 8 }} />
          Đổi vai trò
        </MenuItem>
        <MenuItem onClick={() => menuUser && handleToggleStatus(menuUser)}>
          <i
            className={`ri-${menuUser?.status === 'active' ? 'lock' : 'lock-unlock'}-line`}
            style={{ marginRight: 8 }}
          />
          {menuUser?.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}
        </MenuItem>
        <MenuItem onClick={() => menuUser && handleViewSessions(menuUser)}>
          <i className='ri-computer-line' style={{ marginRight: 8 }} />
          Xem phiên đăng nhập
        </MenuItem>
        <MenuItem onClick={() => menuUser && handleDelete(menuUser)} sx={{ color: 'error.main' }}>
          <i className='ri-delete-bin-line' style={{ marginRight: 8 }} />
          Xóa
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      <UserEditDialog open={editDialogOpen} user={selectedUser} onClose={handleEditDialogClose} onSuccess={loadUsers} />
      <UserDeleteDialog
        open={deleteDialogOpen}
        user={selectedUser}
        multiple={deleteMultiple}
        count={selectedUsers.length}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
      <UserRoleDialog open={roleDialogOpen} user={selectedUser} onClose={handleRoleDialogClose} onSuccess={loadUsers} />
      <UserSessionsDialog open={sessionsDialogOpen} user={selectedUser} onClose={handleSessionsDialogClose} />
    </Box>
  )
}

export default UserListPage
