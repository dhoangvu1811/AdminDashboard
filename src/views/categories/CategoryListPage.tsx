'use client'

import { useEffect, useState, useCallback } from 'react'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Avatar from '@mui/material/Avatar'
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

// Redux Imports
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { fetchCategories, deleteCategory, deleteMultipleCategories } from '@/redux/slices/categorySlice'
import type { Category } from '@/types/category.types'
import { useDebounce } from '@/hooks'

// Dialogs
import CategoryDeleteDialog from './CategoryDeleteDialog'

const CategoryListPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  // Redux state
  const { categories, pagination, isLoading, error } = useAppSelector(state => {
    return state.categories
  })

  // Filter states
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Selection states
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])

  // Dialog & Menu states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteMultiple, setDeleteMultiple] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [menuCategory, setMenuCategory] = useState<Category | null>(null)

  // Fetch Categories Handler
  const loadCategories = useCallback(() => {
    dispatch(
      fetchCategories({
        page: page + 1,
        itemsPerPage: rowsPerPage,
        search: debouncedSearch || undefined
      })
    )
  }, [dispatch, page, rowsPerPage, debouncedSearch])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  // Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
    setPage(0)
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
      setSelectedCategories(categories.map(c => c.id))
    } else {
      setSelectedCategories([])
    }
  }

  const handleSelectCategory = (categoryId: number) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    )
  }

  // Menu Handlers
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, category: Category) => {
    setAnchorEl(event.currentTarget)
    setMenuCategory(category)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setMenuCategory(null)
  }

  // Actions
  const handleCreate = () => {
    router.push('/categories/create')
  }

  const handleEdit = (category: Category) => {
    router.push(`/categories/update/${category.id}`)
    handleCloseMenu()
  }

  const handleDelete = (category: Category) => {
    setSelectedCategory(category)
    setDeleteMultiple(false)
    setDeleteDialogOpen(true)
    handleCloseMenu()
  }

  const handleBulkDelete = () => {
    setDeleteMultiple(true)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (deleteMultiple) {
      await dispatch(deleteMultipleCategories({ ids: selectedCategories }))
      setSelectedCategories([])
    } else if (selectedCategory) {
      await dispatch(deleteCategory(selectedCategory.id))
    }

    setDeleteDialogOpen(false)
    setSelectedCategory(null)
  }

  return (
    <Box>
      <Card>
        <CardHeader
          title='Quản lý danh mục'
          action={
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant='outlined'
                color='secondary'
                onClick={loadCategories}
                startIcon={<i className='ri-refresh-line' />}
              >
                Làm mới
              </Button>
              {selectedCategories.length > 0 && (
                <Button variant='outlined' color='error' onClick={handleBulkDelete}>
                  Xóa ({selectedCategories.length})
                </Button>
              )}
              <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={handleCreate}>
                Thêm danh mục
              </Button>
            </Box>
          }
        />

        {/* Filters */}
        <Box sx={{ p: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size='small'
            placeholder='Tìm kiếm danh mục...'
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
        </Box>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding='checkbox'>
                  <Checkbox
                    checked={categories.length > 0 && selectedCategories.length === categories.length}
                    indeterminate={selectedCategories.length > 0 && selectedCategories.length < categories.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Danh mục</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell align='right'>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align='center' sx={{ py: 10 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align='center' sx={{ py: 10 }}>
                    <Typography color='text.secondary'>{error || 'Không có danh mục nào'}</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map(category => (
                  <TableRow key={category.id} hover>
                    <TableCell padding='checkbox'>
                      <Checkbox
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleSelectCategory(category.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={category.image || undefined}
                          alt={category.name}
                          variant='rounded'
                          sx={{ width: 40, height: 40 }}
                        >
                          {category.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={500}>{category.name}</Typography>
                          <Typography variant='caption' color='text.secondary'>
                            ID: {category.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Box
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          '& p': { m: 0 } // Reset paragraph margins
                        }}
                        dangerouslySetInnerHTML={{ __html: category.description || '-' }}
                        title={category.description?.replace(/<[^>]+>/g, '') || ''} // Keep tooltip plain text or remove if unnecessary
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>
                        {new Date(category.createdAt).toLocaleDateString('vi-VN')}
                      </Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <Tooltip title='Thao tác'>
                        <IconButton onClick={e => handleOpenMenu(e, category)}>
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
        <MenuItem onClick={() => menuCategory && handleEdit(menuCategory)}>
          <i className='ri-edit-line' style={{ marginRight: 8 }} />
          Chỉnh sửa
        </MenuItem>
        <MenuItem onClick={() => menuCategory && handleDelete(menuCategory)} sx={{ color: 'error.main' }}>
          <i className='ri-delete-bin-line' style={{ marginRight: 8 }} />
          Xóa
        </MenuItem>
      </Menu>

      {/* Delete Dialog */}
      <CategoryDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        category={selectedCategory}
        multiple={deleteMultiple}
        count={selectedCategories.length}
      />
    </Box>
  )
}

export default CategoryListPage
