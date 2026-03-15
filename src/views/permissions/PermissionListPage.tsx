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
import TablePagination from '@mui/material/TablePagination'

import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { fetchPermissions, deletePermission } from '@/redux/slices/permissionSlice'
import type { Permission } from '@/types/role.types'

import PermissionDeleteDialog from './PermissionDeleteDialog'

const PermissionListPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const { permissions, pagination, isLoading } = useAppSelector(state => state.permissions)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchPermissions({ page: page + 1, limit: rowsPerPage, search }))
    }, 500)

    return () => clearTimeout(timer)
  }, [dispatch, page, rowsPerPage, search])

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(0)
  }

  const handleDeleteClick = (permission: Permission) => {
    setPermissionToDelete(permission)
  }

  const handleConfirmDelete = async () => {
    if (permissionToDelete) {
      await dispatch(deletePermission(permissionToDelete.id))
      setPermissionToDelete(null)
    }
  }

  return (
    <Card>
      {/* ... Header & Actions ... */}
      <CardHeader
        title='Quản lý Quyền hạn (Permissions)'
        action={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant='outlined'
              startIcon={<i className='ri-refresh-line' />}
              onClick={() => dispatch(fetchPermissions({ page: page + 1, limit: rowsPerPage, search }))}
            >
              Làm mới
            </Button>
            <Button
              variant='contained'
              startIcon={<i className='ri-add-line' />}
              onClick={() => router.push('/permissions/create')}
            >
              Thêm Quyền
            </Button>
          </Box>
        }
      />
      <Box sx={{ p: 4 }}>
        <TextField
          size='small'
          placeholder='Tìm kiếm...'
          value={search}
          onChange={handleSearchChange}
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
              <TableCell>Tên Quyền</TableCell>
              <TableCell align='right'>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} align='center'>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              permissions.map(permission => (
                <TableRow key={permission.id} hover>
                  <TableCell>#{permission.id}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>
                        {permission.displayName}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {permission.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align='right'>
                    <IconButton onClick={() => router.push(`/permissions/update/${permission.id}`)}>
                      <i className='ri-edit-line' />
                    </IconButton>
                    <IconButton color='error' onClick={() => handleDeleteClick(permission)}>
                      <i className='ri-delete-bin-line' />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component='div'
        count={pagination?.totalItems || 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        labelRowsPerPage='Số dòng:'
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
      />

      <PermissionDeleteDialog
        open={Boolean(permissionToDelete)}
        onClose={() => setPermissionToDelete(null)}
        onConfirm={handleConfirmDelete}
        permission={permissionToDelete}
      />
    </Card>
  )
}

export default PermissionListPage
