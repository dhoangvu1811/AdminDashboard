'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import FormHelperText from '@mui/material/FormHelperText'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

// Third Party Imports
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Redux Imports
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { createUser } from '@/redux/slices/userSlice'
import { userCreateSchema, type UserCreateSchema } from '@/utils/rules'

const ROLES = [
  { value: 'admin', label: 'Quản trị viên' },
  { value: 'staff', label: 'Nhân viên' },
  { value: 'user', label: 'Người dùng' }
]

const GENDERS = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' }
]

const UserCreatePage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isLoading } = useAppSelector(state => state.users)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<UserCreateSchema>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      address: '',
      dateOfBirth: '',
      gender: '',
      role: 'user',
      emailVerified: false
    }
  })

  const onSubmit = async (data: UserCreateSchema) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...payload } = data

    const result = await dispatch(createUser(payload))

    if (createUser.fulfilled.match(result)) {
      router.push('/users')
    }
  }

  return (
    <Box component='form' onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader
          title='Thêm người dùng mới'
          action={
            <Button
              variant='text'
              startIcon={<i className='ri-arrow-left-line' />}
              onClick={() => router.push('/users')}
            >
              Quay lại
            </Button>
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={4}>
            {/* Section: Basic Info */}
            <Grid item xs={12}>
              <Typography variant='subtitle1' fontWeight={600} sx={{ mb: 2 }}>
                Thông tin cơ bản
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Họ và tên'
                placeholder='Nguyễn Văn A'
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Email'
                type='email'
                placeholder='example@email.com'
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Mật khẩu'
                type={showPassword ? 'text' : 'password'}
                placeholder='Abc12345@'
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge='end'>
                        <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Xác nhận mật khẩu'
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder='Nhập lại mật khẩu'
                {...register('confirmPassword')}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge='end'>
                        <i className={showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {/* Section: Contact Info */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant='subtitle1' fontWeight={600} sx={{ mb: 2 }}>
                Thông tin liên hệ
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Số điện thoại'
                placeholder='0901234567'
                {...register('phoneNumber')}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Ngày sinh'
                type='date'
                {...register('dateOfBirth')}
                InputLabelProps={{ shrink: true }}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label='Giới tính'
                defaultValue=''
                inputProps={register('gender')}
                error={!!errors.gender}
                helperText={errors.gender?.message}
              >
                <MenuItem value=''>Chọn giới tính</MenuItem>
                {GENDERS.map(g => (
                  <MenuItem key={g.value} value={g.value}>
                    {g.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Địa chỉ'
                placeholder='123 Nguyễn Huệ, Q1, HCM'
                multiline
                rows={2}
                {...register('address')}
                error={!!errors.address}
                helperText={errors.address?.message}
              />
            </Grid>

            {/* Section: Role & Settings */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant='subtitle1' fontWeight={600} sx={{ mb: 2 }}>
                Vai trò & Cài đặt
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label='Vai trò'
                defaultValue='user'
                inputProps={register('role')}
                error={!!errors.role}
                helperText={errors.role?.message || 'Chọn vai trò cho người dùng'}
                required
              >
                {ROLES.map(r => (
                  <MenuItem key={r.value} value={r.value}>
                    {r.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={<Switch defaultChecked={false} {...register('emailVerified')} />}
                label='Email đã xác thực'
              />
              <FormHelperText sx={{ ml: 0 }}>Bật nếu không cần user xác thực email</FormHelperText>
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant='outlined' onClick={() => router.push('/users')} disabled={isLoading}>
                  Hủy
                </Button>
                <Button
                  type='submit'
                  variant='contained'
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : <i className='ri-save-line' />}
                >
                  {isLoading ? 'Đang tạo...' : 'Tạo người dùng'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}

export default UserCreatePage
