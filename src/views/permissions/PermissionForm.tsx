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
import Divider from '@mui/material/Divider'

// Third-party
import { permissionSchema, type PermissionSchema } from '@/utils/rules'
import { createPermission, updatePermission } from '@/redux/slices/permissionSlice'
import { useAppDispatch } from '@/redux/hooks'
import permissionService from '@/services/permissionService'

const PermissionForm = () => {
  const router = useRouter()
  const { id } = useParams()
  const dispatch = useAppDispatch()
  const isEditMode = Boolean(id)

  const [loading, setLoading] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<PermissionSchema>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      name: ''
    }
  })

  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true)
      permissionService
        .getById(id as string)
        .then(res => {
          reset({ name: res.data.name, displayName: res.data.displayName })
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false))
    }
  }, [isEditMode, id, reset])

  const onSubmit = async (data: PermissionSchema) => {
    setLoading(true)

    try {
      if (isEditMode) {
        await dispatch(
          updatePermission({ id: id as string, payload: { name: data.name, displayName: data.displayName } })
        ).unwrap()
        toast.success('Cập nhật quyền hạn thành công')
      } else {
        await dispatch(createPermission({ name: data.name, displayName: data.displayName })).unwrap()
        toast.success('Tạo quyền hạn thành công')
      }

      router.push('/permissions')
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (isEditMode && loading) {
    return <CircularProgress />
  }

  return (
    <Card>
      <CardHeader title={isEditMode ? 'Cập nhật Quyền hạn' : 'Thêm Quyền hạn'} />
      <Divider />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid item xs={12} md={6}>
              <Controller
                name='name'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='System Name (Key)'
                    placeholder='create_user'
                    disabled={isEditMode}
                    error={Boolean(errors.name)}
                    helperText={errors.name?.message || 'Key hệ thống (không thay đổi)'}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='displayName'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Tên hiển thị'
                    placeholder='Tạo người dùng'
                    error={Boolean(errors.displayName)}
                    helperText={errors.displayName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant='outlined' color='secondary' onClick={() => router.push('/permissions')}>
                  Hủy
                </Button>
                <Button type='submit' variant='contained' disabled={loading}>
                  {isEditMode ? 'Lưu' : 'Tạo'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default PermissionForm
