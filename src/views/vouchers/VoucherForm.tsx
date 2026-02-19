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
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import FormHelperText from '@mui/material/FormHelperText'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputAdornment from '@mui/material/InputAdornment'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'

// Utils
import { voucherSchema, type VoucherSchema } from '@/utils/rules'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { createVoucher, updateVoucher } from '@/redux/slices/voucherSlice'

/**
 * Chuyển ISO string hoặc Date sang format "YYYY-MM-DDTHH:mm" cho input datetime-local
 */
const toDateTimeLocal = (value: string | null | undefined): string => {
  if (!value) return ''

  try {
    const date = new Date(value)

    if (isNaN(date.getTime())) return ''

    // Format: YYYY-MM-DDTHH:mm (bỏ giây và timezone)
    const pad = (n: number) => String(n).padStart(2, '0')

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
  } catch {
    return ''
  }
}

const VoucherForm = () => {
  const router = useRouter()
  const { id } = useParams()
  const dispatch = useAppDispatch()

  const isEditMode = Boolean(id)

  const { isLoading, selectedVoucher, error } = useAppSelector(state => state.vouchers)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [watchedType, setWatchedType] = useState<string>('fixed')

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<VoucherSchema>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(voucherSchema) as any,
    defaultValues: {
      code: '',
      type: 'fixed',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      amount: undefined as any,
      maxDiscount: null,
      minOrderValue: null,
      usageLimit: null,
      startDate: null,
      endDate: null,
      isActive: true,
      description: null
    }
  })

  // Watch type để ẩn/hiện maxDiscount
  const currentType = watch('type')

  useEffect(() => {
    setWatchedType(currentType)

    // Khi đổi loại sang 'fixed', xóa giá trị maxDiscount (vì fixed không có giới hạn tối đa)
    if (currentType === 'fixed') {
      setValue('maxDiscount', null)
    }
  }, [currentType, setValue])

  // Điền dữ liệu vào form khi voucher được load từ Redux (do VoucherUpdatePage dispatch)
  useEffect(() => {
    if (isEditMode && selectedVoucher) {
      reset({
        code: selectedVoucher.code,
        type: selectedVoucher.type as 'percent' | 'fixed',
        amount: selectedVoucher.amount,
        maxDiscount: selectedVoucher.maxDiscount ?? null,
        minOrderValue: selectedVoucher.minOrderValue ?? null,
        usageLimit: selectedVoucher.usageLimit ?? null,
        startDate: toDateTimeLocal(selectedVoucher.startDate) || null,
        endDate: toDateTimeLocal(selectedVoucher.endDate) || null,
        isActive: selectedVoucher.isActive,
        description: selectedVoucher.description ?? null
      })
      setWatchedType(selectedVoucher.type)
    }
  }, [isEditMode, selectedVoucher, reset])

  const onSubmit = async (data: VoucherSchema) => {
    setIsSubmitting(true)

    try {
      // Chuyển datetime-local string sang ISO string để gửi lên API
      const payload = {
        code: data.code,
        type: data.type,
        amount: Number(data.amount),
        maxDiscount: data.maxDiscount != null ? Number(data.maxDiscount) : null,
        minOrderValue: data.minOrderValue != null ? Number(data.minOrderValue) : null,
        usageLimit: data.usageLimit != null ? Number(data.usageLimit) : null,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
        isActive: data.isActive,
        description: data.description || null
      }

      if (isEditMode && id) {
        await dispatch(updateVoucher({ id: id as string, payload })).unwrap()
        toast.success('Cập nhật voucher thành công!')
      } else {
        await dispatch(createVoucher(payload)).unwrap()
        toast.success('Tạo voucher thành công!')
      }

      router.push('/vouchers')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorMessage = err?.message || err || 'Có lỗi xảy ra, vui lòng thử lại'

      toast.error(String(errorMessage))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isEditMode && isLoading && !selectedVoucher) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Card>
      <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={isSubmitting}>
        <CircularProgress color='inherit' />
      </Backdrop>

      <CardHeader title={isEditMode ? `Cập nhật voucher: ${selectedVoucher?.code || ''}` : 'Thêm voucher mới'} />
      <Divider />
      <CardContent>
        {error && (
          <Alert severity='error' sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            {/* === CỘT TRÁI: Thông tin chính === */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={4}>
                {/* Mã Voucher */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='code'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Mã Voucher *'
                        placeholder='Ví dụ: SUMMER2025'
                        error={Boolean(errors.code)}
                        helperText={errors.code?.message || 'Chỉ dùng A-Z, 0-9, gạch ngang, gạch dưới'}
                        onChange={e => field.onChange(e.target.value.toUpperCase())}
                        disabled={isEditMode} // Không cho đổi code khi edit
                        inputProps={{ style: { fontFamily: 'monospace', letterSpacing: 1 } }}
                      />
                    )}
                  />
                </Grid>

                {/* Loại Voucher */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='type'
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={Boolean(errors.type)}>
                        <InputLabel>Loại giảm giá *</InputLabel>
                        <Select {...field} label='Loại giảm giá *'>
                          <MenuItem value='percent'>Phần trăm (%)</MenuItem>
                          <MenuItem value='fixed'>Số tiền cố định (VNĐ)</MenuItem>
                        </Select>
                        {errors.type && <FormHelperText>{errors.type?.message}</FormHelperText>}
                      </FormControl>
                    )}
                  />
                </Grid>

                {/* Giá trị giảm */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='amount'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type='number'
                        label='Giá trị giảm *'
                        placeholder={watchedType === 'percent' ? 'Ví dụ: 20' : 'Ví dụ: 50000'}
                        error={Boolean(errors.amount)}
                        helperText={
                          errors.amount?.message ||
                          (watchedType === 'percent' ? 'Nhập từ 1 đến 100 (%)' : 'Nhập số tiền giảm (VNĐ)')
                        }
                        value={field.value ?? ''}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='end'>{watchedType === 'percent' ? '%' : 'VNĐ'}</InputAdornment>
                          )
                        }}
                        inputProps={{
                          min: 0,
                          max: watchedType === 'percent' ? 100 : undefined,
                          step: watchedType === 'percent' ? 1 : 1000
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* Giảm tối đa (chỉ hiện khi type = percent) */}
                {watchedType === 'percent' && (
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name='maxDiscount'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type='number'
                          label='Giảm tối đa'
                          placeholder='Ví dụ: 100000'
                          error={Boolean(errors.maxDiscount)}
                          helperText={errors.maxDiscount?.message || 'Tùy chọn - giới hạn số tiền giảm tối đa'}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                          InputProps={{
                            endAdornment: <InputAdornment position='end'>VNĐ</InputAdornment>
                          }}
                          inputProps={{ min: 0, step: 1000 }}
                        />
                      )}
                    />
                  </Grid>
                )}

                {/* Giá trị đơn tối thiểu */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='minOrderValue'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type='number'
                        label='Đơn hàng tối thiểu'
                        placeholder='Ví dụ: 200000'
                        error={Boolean(errors.minOrderValue)}
                        helperText={errors.minOrderValue?.message || 'Tùy chọn - giá trị đơn tối thiểu để áp dụng'}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                        InputProps={{
                          endAdornment: <InputAdornment position='end'>VNĐ</InputAdornment>
                        }}
                        inputProps={{ min: 0, step: 1000 }}
                      />
                    )}
                  />
                </Grid>

                {/* Giới hạn sử dụng */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='usageLimit'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type='number'
                        label='Giới hạn sử dụng'
                        placeholder='Ví dụ: 100'
                        error={Boolean(errors.usageLimit)}
                        helperText={errors.usageLimit?.message || 'Tùy chọn - để trống = không giới hạn'}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                        InputProps={{
                          endAdornment: <InputAdornment position='end'>lượt</InputAdornment>
                        }}
                        inputProps={{ min: 0, step: 1 }}
                      />
                    )}
                  />
                </Grid>

                {/* Ngày bắt đầu */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='startDate'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type='datetime-local'
                        label='Ngày bắt đầu'
                        error={Boolean(errors.startDate)}
                        helperText={errors.startDate?.message || 'Tùy chọn - để trống = bắt đầu ngay'}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value || null)}
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </Grid>

                {/* Ngày kết thúc */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='endDate'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type='datetime-local'
                        label='Ngày kết thúc'
                        error={Boolean(errors.endDate)}
                        helperText={errors.endDate?.message || 'Tùy chọn - để trống = không hết hạn'}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value || null)}
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </Grid>

                {/* Mô tả */}
                <Grid item xs={12}>
                  <Controller
                    name='description'
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        rows={3}
                        label='Mô tả'
                        placeholder='Nhập mô tả về voucher (tùy chọn)'
                        error={Boolean(errors.description)}
                        helperText={errors.description?.message}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value || null)}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* === CỘT PHẢI: Cấu hình trạng thái === */}
            <Grid item xs={12} md={4}>
              <Card variant='outlined'>
                <CardContent>
                  <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 2 }}>
                    Cài đặt
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  {/* Trạng thái Active */}
                  <Controller
                    name='isActive'
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch checked={field.value} onChange={field.onChange} color='success' />}
                        label={
                          <Box>
                            <Typography variant='body2' fontWeight={500}>
                              {field.value ? 'Đang kích hoạt' : 'Vô hiệu hóa'}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {field.value ? 'Voucher có thể được sử dụng' : 'Voucher sẽ không thể sử dụng'}
                            </Typography>
                          </Box>
                        }
                        sx={{ width: '100%', m: 0 }}
                      />
                    )}
                  />

                  <Divider sx={{ my: 3 }} />

                  {/* Thông tin tóm tắt */}
                  <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 2 }}>
                    Lưu ý
                  </Typography>
                  <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 1 }}>
                    • Mã voucher sẽ tự động chuyển thành chữ HOA
                  </Typography>
                  <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 1 }}>
                    • Nếu type = % thì giá trị tối đa là 100
                  </Typography>
                  <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 1 }}>
                    • Để trống các trường tùy chọn = không giới hạn
                  </Typography>
                  {isEditMode && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant='caption' color='text.secondary' display='block'>
                        Đã sử dụng:{' '}
                        <strong>
                          {selectedVoucher?.usedCount ?? 0}
                          {selectedVoucher?.usageLimit ? ` / ${selectedVoucher.usageLimit}` : ''} lượt
                        </strong>
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Nút hành động */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant='outlined' color='secondary' onClick={() => router.push('/vouchers')}>
                  Hủy
                </Button>
                <Button type='submit' variant='contained' disabled={isSubmitting}>
                  {isSubmitting ? <CircularProgress size={20} color='inherit' sx={{ mr: 1 }} /> : null}
                  {isEditMode ? 'Lưu thay đổi' : 'Tạo Voucher'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default VoucherForm
