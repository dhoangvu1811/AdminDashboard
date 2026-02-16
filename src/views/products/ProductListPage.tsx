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
import {
  fetchProducts,
  fetchProductCategories,
  deleteProduct,
  deleteMultipleProducts
} from '@/redux/slices/productSlice'
import type { ProductFilters, Product } from '@/types/product.types'
import { useDebounce } from '@/hooks'

// Dialogs
import ProductDeleteDialog from './ProductDeleteDialog'

const ProductListPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  // Redux state
  const { products, productCategories, pagination, isLoading, error } = useAppSelector(state => state.products)

  // Filter states
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [sortFilter, setSortFilter] = useState<string>('')

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Selection states
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  // Dialog & Menu states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteMultiple, setDeleteMultiple] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [menuProduct, setMenuProduct] = useState<Product | null>(null)

  // Initial Data Load
  useEffect(() => {
    dispatch(fetchProductCategories())
  }, [dispatch])

  // Fetch Products Handler
  const loadProducts = useCallback(() => {
    const filters: ProductFilters = {
      page: page + 1,
      itemsPerPage: rowsPerPage,
      search: debouncedSearch || undefined,
      categoryId: categoryFilter || undefined,
      sort: (sortFilter || undefined) as ProductFilters['sort']
    }

    dispatch(fetchProducts(filters))
  }, [dispatch, page, rowsPerPage, debouncedSearch, categoryFilter, sortFilter])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
    setPage(0)
  }

  const handleCategoryFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setCategoryFilter(event.target.value as string)
    setPage(0)
  }

  const handleSortFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSortFilter(event.target.value as string)
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
      setSelectedProducts(products.map(p => String(p.id)))
    } else {
      setSelectedProducts([])
    }
  }

  const handleSelectProduct = (productId: number) => {
    const idStr = String(productId)

    setSelectedProducts(prev => (prev.includes(idStr) ? prev.filter(id => id !== idStr) : [...prev, idStr]))
  }

  // Menu Handlers
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, product: Product) => {
    setAnchorEl(event.currentTarget)
    setMenuProduct(product)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setMenuProduct(null)
  }

  // Actions
  const handleCreate = () => {
    router.push('/products/create')
  }

  const handleEdit = (product: Product) => {
    router.push(`/products/update/${product.id}`)
    handleCloseMenu()
  }

  const handleDelete = (product: Product) => {
    setSelectedProduct(product)
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
      await dispatch(deleteMultipleProducts({ productIds: selectedProducts }))
      setSelectedProducts([])
    } else if (selectedProduct) {
      await dispatch(deleteProduct(selectedProduct.id))
    }

    setDeleteDialogOpen(false)
    setSelectedProduct(null)
  }

  // Format Helpers
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  return (
    <Box>
      <Card>
        <CardHeader
          title='Quản lý sản phẩm'
          action={
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant='outlined'
                color='secondary'
                onClick={loadProducts}
                startIcon={<i className='ri-refresh-line' />}
              >
                Làm mới
              </Button>
              {selectedProducts.length > 0 && (
                <Button variant='outlined' color='error' onClick={handleBulkDelete}>
                  Xóa ({selectedProducts.length})
                </Button>
              )}
              <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={handleCreate}>
                Thêm sản phẩm
              </Button>
            </Box>
          }
        />

        {/* Filters */}
        <Box sx={{ p: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size='small'
            placeholder='Tìm kiếm sản phẩm...'
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
            <InputLabel>Danh mục</InputLabel>
            <Select
              value={categoryFilter}
              label='Danh mục'
              onChange={e => handleCategoryFilterChange(e as React.ChangeEvent<{ value: unknown }>)}
            >
              <MenuItem value=''>Tất cả</MenuItem>
              {productCategories.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size='small' sx={{ minWidth: 200 }}>
            <InputLabel>Sắp xếp</InputLabel>
            <Select
              value={sortFilter}
              label='Sắp xếp'
              onChange={e => handleSortFilterChange(e as React.ChangeEvent<{ value: unknown }>)}
            >
              <MenuItem value=''>Mới nhất</MenuItem>
              <MenuItem value='name_asc'>Tên (A-Z)</MenuItem>
              <MenuItem value='name_desc'>Tên (Z-A)</MenuItem>
              <MenuItem value='price_asc'>Giá tăng dần</MenuItem>
              <MenuItem value='price_desc'>Giá giảm dần</MenuItem>
              <MenuItem value='selled_desc'>Bán chạy nhất</MenuItem>
              <MenuItem value='rating_desc'>Đánh giá cao nhất</MenuItem>
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
                    checked={products.length > 0 && selectedProducts.length === products.length}
                    indeterminate={selectedProducts.length > 0 && selectedProducts.length < products.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Sản phẩm</TableCell>
                <TableCell>Danh mục</TableCell>
                <TableCell>Giá</TableCell>
                <TableCell>Giảm giá</TableCell>
                <TableCell>Tồn kho</TableCell>
                <TableCell>Đã bán</TableCell>
                <TableCell>Trạng thái</TableCell>
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
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align='center' sx={{ py: 10 }}>
                    <Typography color='text.secondary'>{error || 'Không có sản phẩm nào'}</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                products.map(product => (
                  <TableRow key={product.id} hover>
                    <TableCell padding='checkbox'>
                      <Checkbox
                        checked={selectedProducts.includes(String(product.id))}
                        onChange={() => handleSelectProduct(product.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={product.image}
                          alt={product.name}
                          variant='rounded'
                          sx={{ width: 50, height: 50 }}
                        />
                        <Box>
                          <Typography fontWeight={500} noWrap sx={{ maxWidth: 200 }}>
                            {product.name}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            ID: {product.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={product.category?.name || 'N/A'} size='small' variant='outlined' />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography fontWeight={500}>
                          {product.discount > 0
                            ? formatCurrency(product.price * ((100 - product.discount) / 100))
                            : formatCurrency(product.price)}
                        </Typography>
                        {product.discount > 0 && (
                          <Typography variant='caption' color='text.secondary' sx={{ textDecoration: 'line-through' }}>
                            {formatCurrency(product.price)}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${product.discount}%`}
                        size='small'
                        color={product.discount > 0 ? 'error' : 'default'}
                        variant={product.discount > 0 ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography color={product.stock > 0 ? 'text.primary' : 'error'}>
                        {product.stock > 0 ? product.stock : 'Hết hàng'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>{product.selled}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.status === 'active' ? 'Hiện' : 'Ẩn'}
                        color={product.status === 'active' ? 'success' : 'default'}
                        size='small'
                      />
                    </TableCell>
                    <TableCell align='right'>
                      <Tooltip title='Thao tác'>
                        <IconButton onClick={e => handleOpenMenu(e, product)}>
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

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem onClick={() => menuProduct && handleEdit(menuProduct)}>
          <i className='ri-edit-line' style={{ marginRight: 8 }} />
          Chỉnh sửa
        </MenuItem>
        <MenuItem onClick={() => menuProduct && handleDelete(menuProduct)} sx={{ color: 'error.main' }}>
          <i className='ri-delete-bin-line' style={{ marginRight: 8 }} />
          Xóa
        </MenuItem>
      </Menu>

      {/* Delete Dialog */}
      <ProductDeleteDialog
        open={deleteDialogOpen}
        product={selectedProduct}
        multiple={deleteMultiple}
        count={selectedProducts.length}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  )
}

export default ProductListPage
