'use client'

import { useEffect, useState, useMemo } from 'react'
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
import Backdrop from '@mui/material/Backdrop'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import FormGroup from '@mui/material/FormGroup'

// Third-party
import { roleSchema, type RoleSchema } from '@/utils/rules'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  createRole,
  updateRole,
  getRoleDetails,
  fetchRolePermissions,
  bulkAssignPermissions
} from '@/redux/slices/roleSlice'
import { fetchPermissions } from '@/redux/slices/permissionSlice'
import roleService from '@/services/roleService'

const RoleForm = () => {
  const router = useRouter()
  const { id } = useParams()
  const dispatch = useAppDispatch()

  const isEditMode = Boolean(id)

  const { isLoading: roleLoading, selectedRole, rolePermissions } = useAppSelector(state => state.roles)
  const { permissions: allPermissions, isLoading: permissionLoading } = useAppSelector(state => state.permissions)

  useEffect(() => {
    if (isEditMode && selectedRole && selectedRole.name === 'admin') {
      toast.error('Không thể chỉnh sửa vai trò Admin')
      router.push('/roles')
    }
  }, [isEditMode, selectedRole, router])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([])

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<RoleSchema>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: ''
    }
  })

  // Initial Data Load
  useEffect(() => {
    dispatch(fetchPermissions())
    if (isEditMode && id) {
      dispatch(getRoleDetails(id as string))
      dispatch(fetchRolePermissions(id as string))
    }
  }, [isEditMode, id, dispatch])

  // Populate Form
  useEffect(() => {
    if (isEditMode && selectedRole) {
      reset({
        name: selectedRole.name,
        displayName: selectedRole.displayName
      })
    }
  }, [isEditMode, selectedRole, reset])

  // Populate Permissions
  useEffect(() => {
    if (isEditMode && rolePermissions) {
      setSelectedPermissionIds(rolePermissions.map(p => p.id))
    }
  }, [isEditMode, rolePermissions])

  const handlePermissionChange = (permissionId: number) => {
    setSelectedPermissionIds(prev =>
      prev.includes(permissionId) ? prev.filter(id => id !== permissionId) : [...prev, permissionId]
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPermissionIds(allPermissions.map(p => p.id))
    } else {
      setSelectedPermissionIds([])
    }
  }

  const onSubmit = async (data: RoleSchema) => {
    setIsSubmitting(true)
    try {
      let roleId = id as string | number

      if (isEditMode) {
        // Update Name
        await dispatch(updateRole({ id: roleId, payload: { name: data.name, displayName: data.displayName } })).unwrap()
      } else {
        // Create Role
        const res = await dispatch(createRole({ name: data.name, displayName: data.displayName })).unwrap()
        // API response might be wrapped in { data: Role }
        const newRole = (res as any).data || res
        roleId = newRole.id
      }

      const initialIds = isEditMode ? rolePermissions.map(p => p.id) : []
      const currentIds = selectedPermissionIds

      const toAdd = currentIds.filter(id => !initialIds.includes(id))
      const toRemove = initialIds.filter(id => !currentIds.includes(id))

      const promises = []

      if (toAdd.length > 0) {
        promises.push(dispatch(bulkAssignPermissions({ id: roleId, payload: { permissionIds: toAdd } })).unwrap())
      }

      if (toRemove.length > 0) {
        // We have to remove one by one as per API doc there is no bulk remove
        // "2.4 Remove Permission - DELETE /v1/roles/:id/permissions/:permissionId"
        toRemove.forEach(pId => {
          promises.push(roleService.removePermission(roleId, pId))
        })
      }

      await Promise.all(promises)

      toast.success(isEditMode ? 'Cập nhật vai trò thành công!' : 'Tạo vai trò thành công!')
      router.push('/roles')
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = roleLoading || permissionLoading

  return (
    <Card>
      <Backdrop
        sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }}
        open={isSubmitting || (isEditMode && isLoading)}
      >
        <CircularProgress color='inherit' />
      </Backdrop>

      <CardHeader title={isEditMode ? `Cập nhật vai trò: ${selectedRole?.name}` : 'Thêm vai trò mới'} />
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
                    placeholder='admin_staff'
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
                rules={{ required: 'Tên hiển thị là bắt buộc' }}
                render={({ field }) => (
                  <TextField {...field} fullWidth label='Tên hiển thị' placeholder='Nhân viên quản trị' />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant='h6'>Phân quyền ({selectedPermissionIds.length})</Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={allPermissions.length > 0 && selectedPermissionIds.length === allPermissions.length}
                      indeterminate={
                        selectedPermissionIds.length > 0 && selectedPermissionIds.length < allPermissions.length
                      }
                      onChange={e => handleSelectAll(e.target.checked)}
                    />
                  }
                  label='Chọn tất cả'
                />
              </Box>
              <Paper variant='outlined' sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
                <Grid container spacing={2}>
                  {allPermissions.map(permission => (
                    <Grid item xs={12} sm={6} md={4} key={permission.id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedPermissionIds.includes(permission.id)}
                            onChange={() => handlePermissionChange(permission.id)}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant='body2'>{permission.displayName || permission.name}</Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {permission.name}
                            </Typography>
                          </Box>
                        }
                      />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant='outlined' color='secondary' onClick={() => router.push('/roles')}>
                  Hủy
                </Button>
                <Button type='submit' variant='contained' disabled={isSubmitting}>
                  {isEditMode ? 'Lưu thay đổi' : 'Tạo vai trò'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

// Helper to fix the missing Paper import since I used it above
import Paper from '@mui/material/Paper'

export default RoleForm
