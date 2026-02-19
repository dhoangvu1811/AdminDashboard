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
import Chip from '@mui/material/Chip'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Checkbox from '@mui/material/Checkbox'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'
import TablePagination from '@mui/material/TablePagination'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'

// Third-party
import toast from 'react-hot-toast'

// Redux Imports
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { fetchVouchers, deleteVoucher, deleteMultipleVouchers, clearVoucherErrors } from '@/redux/slices/voucherSlice'
import type { Voucher } from '@/types/voucher.types'
import { VoucherType } from '@/types/voucher.types'
import { useDebounce } from '@/hooks'

// Dialog
import VoucherDeleteDialog from './VoucherDeleteDialog'

/**
 * Format tiền tệ VNĐ
 */
const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '-'

  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

/**
 * Format ngày giờ
 */
const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-'

  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Tính trạng thái hoạt động thực tế của voucher
 */
const getVoucherStatus = (voucher: Voucher): 'active' | 'inactive' | 'expired' | 'not_started' | 'full' => {
  if (!voucher.isActive) return 'inactive'

  const now = new Date()

  if (voucher.startDate && new Date(voucher.startDate) > now) return 'not_started'
  if (voucher.endDate && new Date(voucher.endDate) < now) return 'expired'
  if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) return 'full'

  return 'active'
}

const VoucherListPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  // Redux state
  const { vouchers, pagination, isLoading, error } = useAppSelector(state => state.vouchers)

  // Filter states
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [sortFilter, setSortFilter] = useState<string>('')

  // Selection states
  const [selectedVouchers, setSelectedVouchers] = useState<number[]>([])

  // Dialog & Menu states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isMultipleDelete, setIsMultipleDelete] = useState(false)
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [menuVoucher, setMenuVoucher] = useState<Voucher | null>(null)

  // Load Vouchers
  const loadVouchers = useCallback(() => {
    dispatch(
      fetchVouchers({
        page: page + 1,
        itemsPerPage: rowsPerPage,
        search: debouncedSearch || undefined,
        type: typeFilter || undefined,
        isActive: statusFilter || undefined,
        sort: sortFilter || undefined
      })
    )
  }, [dispatch, page, rowsPerPage, debouncedSearch, typeFilter, statusFilter, sortFilter])

  useEffect(() => {
    loadVouchers()
  }, [loadVouchers])

  // Reset page khi filter thay đổi
  useEffect(() => {
    setPage(0)
  }, [debouncedSearch, typeFilter, statusFilter, sortFilter])

  // Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
  }

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Selection Handlers
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedVouchers(vouchers.map(v => v.id))
    } else {
      setSelectedVouchers([])
    }
  }

  const handleSelectVoucher = (voucherId: number) => {
    setSelectedVouchers(prev => (prev.includes(voucherId) ? prev.filter(id => id !== voucherId) : [...prev, voucherId]))
  }

  // Menu Handlers
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, voucher: Voucher) => {
    setAnchorEl(event.currentTarget)
    setMenuVoucher(voucher)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setMenuVoucher(null)
  }

  // Actions
  const handleCreate = () => {
    router.push('/vouchers/create')
  }

  const handleEdit = (voucher: Voucher) => {
    router.push(`/vouchers/update/${voucher.id}`)
    handleCloseMenu()
  }

  const handleDelete = (voucher: Voucher) => {
    setSelectedVoucher(voucher)
    setIsMultipleDelete(false)
    setDeleteDialogOpen(true)
    handleCloseMenu()
  }

  const handleBulkDelete = () => {
    setIsMultipleDelete(true)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    try {
      if (isMultipleDelete) {
        await dispatch(deleteMultipleVouchers({ voucherIds: selectedVouchers.map(String) })).unwrap()
        toast.success(`Đã xóa ${selectedVouchers.length} voucher thành công`)
        setSelectedVouchers([])
      } else if (selectedVoucher) {
        await dispatch(deleteVoucher(selectedVoucher.id)).unwrap()
        toast.success(`Đã xóa voucher "${selectedVoucher.code}" thành công`)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.message || err || 'Xóa voucher thất bại')
    } finally {
      setDeleteDialogOpen(false)
      setSelectedVoucher(null)
    }
  }

  // Render trạng thái voucher
  const renderStatusChip = (voucher: Voucher) => {
    const status = getVoucherStatus(voucher)

    const statusMap = {
      active: { label: 'Đang hoạt động', color: 'success' as const },
      inactive: { label: 'Vô hiệu hóa', color: 'default' as const },
      expired: { label: 'Hết hạn', color: 'error' as const },
      not_started: { label: 'Chưa bắt đầu', color: 'warning' as const },
      full: { label: 'Đã dùng hết', color: 'error' as const }
    }

    const { label, color } = statusMap[status]

    return <Chip label={label} color={color} size='small' />
  }

  // Render loại voucher
  const renderTypeChip = (type: string) => {
    if (type === VoucherType.PERCENT) {
      return <Chip label='Phần trăm (%)' color='info' size='small' variant='outlined' />
    }

    return <Chip label='Số tiền cố định' color='secondary' size='small' variant='outlined' />
  }

  // Render progress sử dụng
  const renderUsageProgress = (voucher: Voucher) => {
    if (!voucher.usageLimit) {
      return (
        <Typography variant='body2' color='text.secondary'>
          {voucher.usedCount} / ∞
        </Typography>
      )
    }

    const percent = Math.min(100, (voucher.usedCount / voucher.usageLimit) * 100)

    return (
      <Box sx={{ minWidth: 100 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant='caption'>
            {voucher.usedCount}/{voucher.usageLimit}
          </Typography>
          <Typography variant='caption'>{Math.round(percent)}%</Typography>
        </Box>
        <LinearProgress
          variant='determinate'
          value={percent}
          color={percent >= 100 ? 'error' : percent >= 80 ? 'warning' : 'primary'}
          sx={{ height: 6, borderRadius: 3 }}
        />
      </Box>
    )
  }

  return (
    <Box>
      {/* Hiển thị lỗi tổng quát */}
      {error && (
        <Alert severity='error' sx={{ mb: 3 }} onClose={() => dispatch(clearVoucherErrors())}>
          {error}
        </Alert>
      )}
      <Card>
        <CardHeader
          title='Quản lý Voucher'
          action={
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant='outlined'
                color='secondary'
                onClick={loadVouchers}
                startIcon={<i className='ri-refresh-line' />}
              >
                Làm mới
              </Button>
              {selectedVouchers.length > 0 && (
                <Button variant='outlined' color='error' onClick={handleBulkDelete}>
                  Xóa ({selectedVouchers.length})
                </Button>
              )}
              <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={handleCreate}>
                Thêm Voucher
              </Button>
            </Box>
          }
        />

        {/* Filters */}
        <Box sx={{ p: 4, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <TextField
            size='small'
            placeholder='Tìm kiếm mã voucher...'
            value={search}
            onChange={handleSearchChange}
            sx={{ minWidth: 220 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='ri-search-line' />
                </InputAdornment>
              )
            }}
          />

          {/* Filter Type */}
          <FormControl size='small' sx={{ minWidth: 160 }}>
            <InputLabel>Loại voucher</InputLabel>
            <Select value={typeFilter} label='Loại voucher' onChange={e => setTypeFilter(e.target.value)}>
              <MenuItem value=''>Tất cả</MenuItem>
              <MenuItem value='percent'>Phần trăm (%)</MenuItem>
              <MenuItem value='fixed'>Số tiền cố định</MenuItem>
            </Select>
          </FormControl>

          {/* Filter Status */}
          <FormControl size='small' sx={{ minWidth: 160 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select value={statusFilter} label='Trạng thái' onChange={e => setStatusFilter(e.target.value)}>
              <MenuItem value=''>Tất cả</MenuItem>
              <MenuItem value='true'>Đang kích hoạt</MenuItem>
              <MenuItem value='false'>Vô hiệu hóa</MenuItem>
            </Select>
          </FormControl>

          {/* Sort */}
          <FormControl size='small' sx={{ minWidth: 180 }}>
            <InputLabel>Sắp xếp theo</InputLabel>
            <Select value={sortFilter} label='Sắp xếp theo' onChange={e => setSortFilter(e.target.value)}>
              <MenuItem value=''>Mới nhất</MenuItem>
              <MenuItem value='code_asc'>Mã A → Z</MenuItem>
              <MenuItem value='code_desc'>Mã Z → A</MenuItem>
              <MenuItem value='amount_desc'>Giá trị cao nhất</MenuItem>
              <MenuItem value='amount_asc'>Giá trị thấp nhất</MenuItem>
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
                    checked={vouchers.length > 0 && selectedVouchers.length === vouchers.length}
                    indeterminate={selectedVouchers.length > 0 && selectedVouchers.length < vouchers.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Mã Voucher</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Giá trị giảm</TableCell>
                <TableCell>Đơn tối thiểu</TableCell>
                <TableCell>Lượt sử dụng</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Thời gian hiệu lực</TableCell>
                <TableCell align='right'>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} align='center' sx={{ py: 10 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : vouchers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align='center' sx={{ py: 10 }}>
                    <Typography color='text.secondary'>{error || 'Không có voucher nào'}</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                vouchers.map(voucher => (
                  <TableRow key={voucher.id} hover>
                    <TableCell padding='checkbox'>
                      <Checkbox
                        checked={selectedVouchers.includes(voucher.id)}
                        onChange={() => handleSelectVoucher(voucher.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography fontWeight={600} sx={{ fontFamily: 'monospace', letterSpacing: 0.5 }}>
                          {voucher.code}
                        </Typography>
                        {voucher.description && (
                          <Typography
                            variant='caption'
                            color='text.secondary'
                            noWrap
                            sx={{ maxWidth: 180, display: 'block' }}
                          >
                            {voucher.description.replace(/<[^>]+>/g, '')}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{renderTypeChip(voucher.type)}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography fontWeight={500}>
                          {voucher.type === VoucherType.PERCENT ? `${voucher.amount}%` : formatCurrency(voucher.amount)}
                        </Typography>
                        {voucher.type === VoucherType.PERCENT && voucher.maxDiscount && (
                          <Typography variant='caption' color='text.secondary'>
                            Tối đa: {formatCurrency(voucher.maxDiscount)}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{formatCurrency(voucher.minOrderValue)}</Typography>
                    </TableCell>
                    <TableCell>{renderUsageProgress(voucher)}</TableCell>
                    <TableCell>{renderStatusChip(voucher)}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant='caption' display='block'>
                          Từ: {formatDate(voucher.startDate)}
                        </Typography>
                        <Typography variant='caption' display='block' color='text.secondary'>
                          Đến: {formatDate(voucher.endDate)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align='right'>
                      <Tooltip title='Thao tác'>
                        <IconButton onClick={e => handleOpenMenu(e, voucher)}>
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
          count={pagination?.totalItems || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage='Số dòng:'
          labelDisplayedRows={({ from, to, count }: { from: number; to: number; count: number }) =>
            `${from}-${to} / ${count}`
          }
        />
      </Card>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem onClick={() => menuVoucher && handleEdit(menuVoucher)}>
          <i className='ri-edit-line' style={{ marginRight: 8 }} />
          Chỉnh sửa
        </MenuItem>
        <MenuItem onClick={() => menuVoucher && handleDelete(menuVoucher)} sx={{ color: 'error.main' }}>
          <i className='ri-delete-bin-line' style={{ marginRight: 8 }} />
          Xóa
        </MenuItem>
      </Menu>

      {/* Delete Dialog */}
      <VoucherDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        voucher={selectedVoucher}
        multiple={isMultipleDelete}
        count={selectedVouchers.length}
      />
    </Box>
  )
}

export default VoucherListPage
