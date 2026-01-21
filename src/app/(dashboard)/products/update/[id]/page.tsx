'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { fetchProductById, clearSelectedProduct } from '@/redux/slices/productSlice'
import ProductForm from '@/views/products/ProductForm'

import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const ProductUpdatePage = () => {
  const { id } = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()

  const { selectedProduct, isLoadingDetail, error } = useAppSelector(state => state.products)

  useEffect(() => {
    if (id) {
      // Fetch product details
      dispatch(fetchProductById(id as string))
    }

    // Cleanup
    return () => {
      dispatch(clearSelectedProduct())
    }
  }, [dispatch, id])

  if (isLoadingDetail) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 5, textAlign: 'center' }}>
        <Typography color='error' variant='h5' gutterBottom>
          Lỗi: {error}
        </Typography>
        <Typography variant='body1'>Không tìm thấy sản phẩm hoặc có lỗi xảy ra.</Typography>
      </Box>
    )
  }

  return <ProductForm initialData={selectedProduct || undefined} isEdit={true} />
}

export default ProductUpdatePage
