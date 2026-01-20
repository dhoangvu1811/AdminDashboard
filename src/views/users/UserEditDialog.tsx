'use client'

import { useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'

// Third Party Imports
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Redux Imports
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { updateUser } from '@/redux/slices/userSlice'
import { userEditSchema, type UserEditSchema } from '@/utils/rules'
import type { User } from '@/types/auth.types'

interface UserEditDialogProps {
  open: boolean
  user: User | null
  onClose: () => void
  onSuccess: () => void
}

const UserEditDialog = ({ open, user, onClose, onSuccess }: UserEditDialogProps) => {
  const dispatch = useAppDispatch()
  const { isLoading } = useAppSelector(state => state.users)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm<UserEditSchema>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      address: '',
      dateOfBirth: '',
      gender: '',
      status: 'active'
    }
  })

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth?.split('T')[0] || '',
        gender: user.gender || '',
        status: user.status || 'active'
      })
    }
  }, [user, reset])

  const onSubmit = async (data: UserEditSchema) => {
    if (!user) return

    const result = await dispatch(updateUser({ id: user.id, payload: data }))

    if (updateUser.fulfilled.match(result)) {
      onSuccess()
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
      <DialogContent>
        <form id='user-edit-form' onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Họ và tên'
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Email'
                type='email'
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
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
                name='status'
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    fullWidth
                    label='Trạng thái'
                    {...field}
                    error={!!errors.status}
                    helperText={errors.status?.message}
                  >
                    <MenuItem value='active'>Hoạt động</MenuItem>
                    <MenuItem value='inactive'>Đã khóa</MenuItem>
                  </TextField>
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
            <Grid item xs={12} sm={6}>
              <Controller
                name='gender'
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    fullWidth
                    label='Giới tính'
                    {...field}
                    error={!!errors.gender}
                    helperText={errors.gender?.message}
                  >
                    <MenuItem value=''>Chọn giới tính</MenuItem>
                    <MenuItem value='male'>Nam</MenuItem>
                    <MenuItem value='female'>Nữ</MenuItem>
                    <MenuItem value='other'>Khác</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Địa chỉ'
                multiline
                rows={2}
                {...register('address')}
                error={!!errors.address}
                helperText={errors.address?.message}
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Hủy
        </Button>
        <Button variant='contained' type='submit' form='user-edit-form' disabled={isLoading}>
          {isLoading ? <CircularProgress size={20} /> : 'Lưu thay đổi'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UserEditDialog
