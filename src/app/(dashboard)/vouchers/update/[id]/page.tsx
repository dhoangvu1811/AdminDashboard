'use client'

import { useEffect } from 'react'

import { useParams } from 'next/navigation'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { getVoucherDetails, setSelectedVoucher } from '@/redux/slices/voucherSlice'
import VoucherForm from '@/views/vouchers/VoucherForm'

const VoucherUpdatePage = () => {
  const { id } = useParams()
  const dispatch = useAppDispatch()
  const { selectedVoucher, isLoading, error } = useAppSelector(state => state.vouchers)

  useEffect(() => {
    if (id) {
      dispatch(getVoucherDetails(id as string))
    }

    // Cleanup khi rời trang
    return () => {
      dispatch(setSelectedVoucher(null))
    }
  }, [id, dispatch])

  // Hiển thị loading khi đang tải
  if (isLoading && !selectedVoucher) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  // Hiển thị lỗi nếu không tìm thấy
  if (!isLoading && !selectedVoucher && error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 10 }}>
        <Typography color='error'>{error}</Typography>
      </Box>
    )
  }

  return <VoucherForm />
}

export default VoucherUpdatePage
