'use client'

// React Imports
import { useState, useEffect } from 'react'
import type { ChangeEvent } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import FormHelperText from '@mui/material/FormHelperText'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'

// Third-party Imports
import toast from 'react-hot-toast'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Redux Imports
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { checkAuth } from '@/redux/slices/authSlice'
import { fetchMyPermissions } from '@/redux/slices/permissionSlice'
import { userService } from '@/services/userService'
import { profileSchema, type ProfileSchema } from '@/utils/rules'
import { isAdmin } from '@/utils/checkPermission'

const AccountDetails = () => {
  // Hooks
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.auth)
  const { myPermissions } = useAppSelector(state => state.permissions)
  const isUserAdmin = isAdmin(user)

  // States
  const [fileInput, setFileInput] = useState<File | null>(null)
  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
      address: '',
      dateOfBirth: '',
      gender: ''
    }
  })

  useEffect(() => {
    dispatch(fetchMyPermissions())
  }, [dispatch])

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth?.split('T')[0] || '',
        gender: user.gender || ''
      })

      if (user.avatar) {
        setImgSrc(user.avatar)
      }
    }
  }, [user, reset])

  const handleFileInputChange = (file: ChangeEvent) => {
    const reader = new FileReader()
    const { files } = file.target as HTMLInputElement

    if (files && files.length !== 0) {
      reader.onload = () => setImgSrc(reader.result as string)
      reader.readAsDataURL(files[0])
      setFileInput(files[0])
    }
  }

  const handleFileInputReset = () => {
    setFileInput(null)
    setImgSrc(user?.avatar || '/images/avatars/1.png')
  }

  const onSubmit = async (data: ProfileSchema) => {
    setIsLoading(true)

    try {
      const payload = new FormData()

      payload.append('name', data.name)
      if (data.phoneNumber) payload.append('phoneNumber', data.phoneNumber)
      if (data.address) payload.append('address', data.address)
      if (data.dateOfBirth) payload.append('dateOfBirth', data.dateOfBirth)
      if (data.gender) payload.append('gender', data.gender)

      if (fileInput) {
        payload.append('avatar', fileInput)
      }

      await userService.updateProfile(payload)

      // Refresh user data
      await dispatch(checkAuth())

      toast.success('Cập nhật hồ sơ thành công!')
    } catch (error: any) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    await Promise.all([dispatch(checkAuth()), dispatch(fetchMyPermissions())])
    setIsLoading(false)
  }

  const handleReset = () => {
    if (user) {
      handleFileInputReset()
      reset({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth?.split('T')[0] || '',
        gender: user.gender || ''
      })
    }
  }

  return (
    <Card>
      <CardContent className='mbe-5'>
        <div className='flex max-sm:flex-col items-center gap-6'>
          <img height={100} width={100} className='rounded' src={imgSrc} alt='Profile' />
          <div className='flex flex-grow flex-col gap-4'>
            <div className='flex flex-col sm:flex-row gap-4'>
              <Button component='label' size='small' variant='contained' htmlFor='account-settings-upload-image'>
                Upload New Photo
                <input
                  hidden
                  type='file'
                  accept='image/png, image/jpeg'
                  onChange={handleFileInputChange}
                  id='account-settings-upload-image'
                />
              </Button>
              <Button size='small' variant='outlined' color='error' onClick={handleFileInputReset}>
                Reset
              </Button>
            </div>
            <Typography>Allowed JPG, GIF or PNG. Max size of 800K</Typography>
          </div>
        </div>
      </CardContent>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Họ và tên'
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Email'
                value={user?.email || ''}
                disabled
                helperText='Email không thể thay đổi'
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Số điện thoại'
                {...register('phoneNumber')}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='gender'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.gender}>
                    <InputLabel>Giới tính</InputLabel>
                    <Select label='Giới tính' {...field} value={field.value || ''}>
                      <MenuItem value='male'>Nam</MenuItem>
                      <MenuItem value='female'>Nữ</MenuItem>
                      <MenuItem value='other'>Khác</MenuItem>
                    </Select>
                    {errors.gender && <FormHelperText>{errors.gender.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type='date'
                label='Ngày sinh'
                InputLabelProps={{ shrink: true }}
                {...register('dateOfBirth')}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Địa chỉ'
                {...register('address')}
                error={!!errors.address}
                helperText={errors.address?.message}
              />
            </Grid>

            {/* My Permissions Section */}
            <Grid item xs={12}>
              <Divider sx={{ mb: 4 }} />
              <Typography variant='h6' sx={{ mb: 2 }}>
                Quyền hạn của tôi
              </Typography>
              {isUserAdmin ? (
                <Alert severity='info' sx={{ mb: 2 }}>
                  Bạn là <strong>Quản trị viên</strong> và có toàn quyền truy cập hệ thống.
                </Alert>
              ) : myPermissions.length > 0 ? (
                <div className='flex flex-wrap gap-2'>
                  {myPermissions.map(permission => (
                    <Chip
                      key={permission.id}
                      label={permission.displayName}
                      color='primary'
                      variant='outlined'
                      size='small'
                    />
                  ))}
                </div>
              ) : (
                <Typography variant='body2' color='text.secondary'>
                  Bạn chưa được cấp quyền hạn nào.
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} className='flex gap-4 flex-wrap'>
              <Button variant='contained' type='submit' disabled={isLoading}>
                {isLoading ? <CircularProgress size={24} color='inherit' /> : 'Lưu thay đổi'}
              </Button>
              <Button variant='outlined' type='button' color='secondary' onClick={handleRefresh} disabled={isLoading}>
                Làm mới dữ liệu
              </Button>
              <Button variant='outlined' type='reset' color='secondary' onClick={handleReset}>
                Reset
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default AccountDetails
