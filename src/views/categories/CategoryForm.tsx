'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Backdrop from '@mui/material/Backdrop'

// Third-party
import { categorySchema, type CategorySchema } from '@/utils/rules'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { createCategory, updateCategory, getCategoryDetails } from '@/redux/slices/categorySlice'
import ImageUploader from '@/components/shared/ImageUploader'
import RichTextEditor from '@/components/shared/RichTextEditor'

const CategoryForm = () => {
  const router = useRouter()
  const { id } = useParams()
  const dispatch = useAppDispatch()

  const isEditMode = Boolean(id)

  const { isLoading, selectedCategory, error } = useAppSelector(state => state.categories)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagesToUpload, setImagesToUpload] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<CategorySchema>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: '',
      description: '',
      image: null
    }
  })

  // Load initial data for Edit Mode
  useEffect(() => {
    if (isEditMode && id) {
      dispatch(getCategoryDetails(id as string))
    }
  }, [isEditMode, id, dispatch])

  // Populate form when selectedCategory changes
  useEffect(() => {
    if (isEditMode && selectedCategory) {
      reset({
        name: selectedCategory.name,
        description: selectedCategory.description || '',
        image: selectedCategory.image || null
      })
      if (selectedCategory.image) {
        setExistingImages([selectedCategory.image])
      } else {
        setExistingImages([])
      }
    }
  }, [isEditMode, selectedCategory, reset])

  const onSubmit = async (data: CategorySchema) => {
    setIsSubmitting(true)
    try {
      if (isEditMode && id) {
        await dispatch(
          updateCategory({
            id: id as string,
            payload: {
              name: data.name,
              description: data.description,
              image: data.image === null || data.image === undefined ? null : (data.image as File | string) // Explicitly pass null for deletion
            }
          })
        ).unwrap()
        toast.success('Cập nhật danh mục thành công!')
      } else {
        // Create Mode
        if (!data.name) return
        await dispatch(
          createCategory({
            name: data.name,
            description: data.description,
            image: data.image as File | string | undefined
          })
        ).unwrap()
        toast.success('Tạo danh mục thành công!')
      }
      router.push('/categories')
    } catch (err: any) {
      console.error(err)
      toast.error(typeof err === 'string' ? err : 'Có lỗi xảy ra')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageChange = (files: File[], remainingInitialImages: string[]) => {
    setImagesToUpload(files)
    setExistingImages(remainingInitialImages)

    if (files.length > 0) {
      setValue('image', files[0], { shouldValidate: true })
    } else if (remainingInitialImages.length > 0) {
      setValue('image', remainingInitialImages[0], { shouldValidate: true })
    } else {
      setValue('image', null, { shouldValidate: true })
    }
  }

  if (isEditMode && isLoading && !selectedCategory) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Card>
      <Backdrop
        sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }}
        open={isSubmitting || (isEditMode && isLoading)}
      >
        <CircularProgress color='inherit' />
      </Backdrop>

      <CardHeader title={isEditMode ? `Cập nhật danh mục: ${selectedCategory?.name}` : 'Thêm danh mục mới'} />
      <Divider />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid item xs={12} md={8}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Controller
                    name='name'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Tên danh mục'
                        placeholder='Nhập tên danh mục'
                        error={Boolean(errors.name)}
                        helperText={errors.name?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name='description'
                    control={control}
                    render={({ field }) => (
                      <Controller
                        name='description'
                        control={control}
                        render={({ field }) => (
                          <Box>
                            <Typography variant='body2' sx={{ mb: 1 }}>
                              Mô tả
                            </Typography>
                            <RichTextEditor
                              value={field.value || ''}
                              onChange={field.onChange}
                              placeholder='Nhập mô tả danh mục (tùy chọn)'
                            />
                            {errors.description && (
                              <Typography variant='caption' color='error' sx={{ mt: 0.5, display: 'block' }}>
                                {errors.description.message}
                              </Typography>
                            )}
                          </Box>
                        )}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Right Side - Image Logic */}
            <Grid item xs={12} md={4}>
              <Card variant='outlined'>
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ fontWeight: 500, mb: 1 }}>Hình ảnh</Box>
                    <ImageUploader initialImages={existingImages} onChange={handleImageChange} maxImages={1} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant='outlined' color='secondary' onClick={() => router.push('/categories')}>
                  Hủy
                </Button>
                <Button type='submit' variant='contained' disabled={isSubmitting}>
                  {isEditMode ? 'Lưu thay đổi' : 'Tạo danh mục'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default CategoryForm
