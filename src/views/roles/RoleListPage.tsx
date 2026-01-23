'use client'

import { useEffect, useState } from 'react'
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
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'

// Redux
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { fetchRoles, deleteRole } from '@/redux/slices/roleSlice'
import type { Role } from '@/types/role.types'

import RoleDeleteDialog from './RoleDeleteDialog'

const RoleListPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const { roles, isLoading, error } = useAppSelector(state => state.roles)

  const [search, setSearch] = useState('')
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

  useEffect(() => {
    dispatch(fetchRoles())
  }, [dispatch])

  // Client-side filtering
  const filteredRoles = roles.filter(role => role.name.toLowerCase().includes(search.toLowerCase()))

  const handleEdit = (id: number) => {
    router.push(`/roles/update/${id}`)
  }

  const handleDeleteClick = (role: Role) => {
    setRoleToDelete(role)
  }

  const handleConfirmDelete = async () => {
    if (roleToDelete) {
      await dispatch(deleteRole(roleToDelete.id))
      setRoleToDelete(null)
    }
  }

  return (
    <Box>
      <Card>
        <CardHeader
          title='Quản lý vai trò (Roles)'
          action={
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant='outlined'
                startIcon={<i className='ri-refresh-line' />}
                onClick={() => dispatch(fetchRoles())}
              >
                Làm mới
              </Button>
              <Button
                variant='contained'
                startIcon={<i className='ri-add-line' />}
                onClick={() => router.push('/roles/create')}
              >
                Thêm vai trò
              </Button>
            </Box>
          }
        />

        <Box sx={{ p: 4 }}>
          <TextField
            size='small'
            placeholder='Tìm kiếm vai trò...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ maxWidth: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='ri-search-line' />
                </InputAdornment>
              )
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tên vai trò</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell align='right'>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} align='center' sx={{ py: 10 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align='center' sx={{ py: 10 }}>
                    <Typography color='text.secondary'>Không tìm thấy dữ liệu</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoles.map(role => (
                  <TableRow key={role.id} hover>
                    <TableCell>#{role.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          {role.displayName}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {role.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{role.createdAt ? new Date(role.createdAt).toLocaleDateString() : '-'}</TableCell>
                    <TableCell align='right'>
                      {role.name === 'admin' ? (
                        <Tooltip title='Không thể chỉnh sửa vai trò Quản trị viên'>
                          <IconButton color='default' disabled>
                            <i className='ri-lock-line' />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <>
                          <Tooltip title='Chỉnh sửa & Phân quyền'>
                            <IconButton color='primary' onClick={() => handleEdit(role.id)}>
                              <i className='ri-edit-line' />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Xóa'>
                            <IconButton color='error' onClick={() => handleDeleteClick(role)}>
                              <i className='ri-delete-bin-line' />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <RoleDeleteDialog
        open={Boolean(roleToDelete)}
        onClose={() => setRoleToDelete(null)}
        onConfirm={handleConfirmDelete}
        role={roleToDelete}
      />
    </Box>
  )
}

export default RoleListPage
