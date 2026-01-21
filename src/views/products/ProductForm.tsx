'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import Backdrop from '@mui/material/Backdrop'

// Third Party Imports
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'

// Logic
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { createProduct, updateProduct, fetchProductCategories } from '@/redux/slices/productSlice'
import { productService } from '@/services/productService'
import { productSchema, type ProductSchema } from '@/utils/rules'
import type { Product } from '@/types/product.types'
import ImageUploader from '@/components/shared/ImageUploader'
import RichTextEditor from '@/components/shared/RichTextEditor'

interface ProductFormProps {
  initialData?: Product
  isEdit?: boolean
}

const ProductForm = ({ initialData, isEdit = false }: ProductFormProps) => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const { productCategories, isLoading } = useAppSelector(state => state.products)
  const [imagesToUpload, setImagesToUpload] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<ProductSchema>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: '',
      categoryId: 0,
      price: 0,
      stock: 0,
      rating: 0,
      description: '',
      discount: 0,
      status: 'active',
      image: ''
    }
  })

  // Load initial data
  useEffect(() => {
    dispatch(fetchProductCategories())

    if (initialData) {
      setValue('name', initialData.name)
      setValue('categoryId', initialData.categoryId)
      setValue('price', initialData.price)
      setValue('stock', initialData.stock)
      setValue('rating', initialData.rating)
      setValue('description', initialData.description)
      setValue('discount', initialData.discount)
      setValue('status', initialData.status as 'active' | 'inactive')

      const galleryImages = initialData.images?.map(img => img.image) || []
      const combinedImages = initialData.image ? [initialData.image, ...galleryImages] : galleryImages
      // Remove duplicates
      const uniqueImages = Array.from(new Set(combinedImages))

      setExistingImages(uniqueImages)
    }
  }, [dispatch, initialData, setValue])

  const handleImageChange = (files: File[], remainingUrls: string[]) => {
    setImagesToUpload(files)
    setExistingImages(remainingUrls)
  }

  const onSubmit = async (data: ProductSchema) => {
    if (imagesToUpload.length === 0 && existingImages.length === 0) {
      toast.error('Vui lòng tải lên ít nhất 1 ảnh')
      return
    }

    try {
      setIsSubmitting(true)

      // 1. Upload new images
      const uploadPromises = imagesToUpload.map(file => productService.uploadImage(file))
      const uploadResponses = await Promise.all(uploadPromises)

      // Extract URLs from response.data.imageUrl
      const newImageUrls = uploadResponses.map(res => res.data.imageUrl)

      // Combining images
      const allImages = [...existingImages, ...newImageUrls]

      // Use the first image as the main thumbnail
      const primaryImage = allImages[0] || ''

      // Payload preparation
      const payload = {
        ...data,
        image: primaryImage,
        // Send all images to the 'images' field for the gallery
        images: allImages
      }

      if (isEdit && initialData) {
        await dispatch(updateProduct({ id: initialData.id, payload }))
        router.push('/products')
      } else {
        await dispatch(createProduct(payload))
        router.push('/products')
      }
    } catch (error) {
      console.error(error)
      // Toast handled in slice
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader title={isEdit ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'} />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
              <Controller
                name='name'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Tên sản phẩm'
                    error={Boolean(errors.name)}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='categoryId'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label='Loại sản phẩm'
                    error={Boolean(errors.categoryId)}
                    helperText={errors.categoryId?.message}
                  >
                    {productCategories.map(cat => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                    {/* Fallback if no categories */}
                    {!productCategories.length && (
                      <MenuItem value={0} disabled>
                        Không có danh mục
                      </MenuItem>
                    )}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='price'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Giá (VNĐ)'
                    InputProps={{
                      endAdornment: <InputAdornment position='end'>VNĐ</InputAdornment>
                    }}
                    error={Boolean(errors.price)}
                    helperText={errors.price?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='stock'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Số lượng tồn kho'
                    error={Boolean(errors.stock)}
                    helperText={errors.stock?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='discount'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Giảm giá (%)'
                    InputProps={{
                      endAdornment: <InputAdornment position='end'>%</InputAdornment>
                    }}
                    error={Boolean(errors.discount)}
                    helperText={errors.discount?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='status'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label='Trạng thái'
                    error={Boolean(errors.status)}
                    helperText={errors.status?.message}
                  >
                    <MenuItem value='active'>Hoạt động</MenuItem>
                    <MenuItem value='inactive'>Ẩn</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='description'
                control={control}
                render={({ field }) => (
                  <Box>
                    <Typography variant='body2' sx={{ mb: 1 }}>
                      Mô tả sản phẩm
                    </Typography>
                    <RichTextEditor
                      value={field.value || ''}
                      onChange={field.onChange}
                      placeholder='Nhập mô tả chi tiết sản phẩm...'
                    />
                    {errors.description && (
                      <Typography variant='caption' color='error' sx={{ mt: 0.5, display: 'block' }}>
                        {errors.description.message}
                      </Typography>
                    )}
                  </Box>
                )}
              />
            </Grid>

            {/* Image Upload */}
            <Grid item xs={12}>
              <Typography variant='subtitle1' sx={{ mb: 2 }}>
                Hình ảnh sản phẩm
              </Typography>
              <ImageUploader initialImages={existingImages} onChange={handleImageChange} maxImages={5} />
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant='outlined' color='secondary' onClick={() => router.back()}>
                Hủy bỏ
              </Button>
              <Button type='submit' variant='contained' disabled={isSubmitting || isLoading}>
                {isSubmitting ? <CircularProgress size={24} /> : isEdit ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>

      <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={isSubmitting || isLoading}>
        <CircularProgress color='inherit' />
      </Backdrop>
    </Card>
  )
}

export default ProductForm
