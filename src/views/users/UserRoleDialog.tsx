'use client'

import { useState, useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

// Redux Imports
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { changeUserRole } from '@/redux/slices/userSlice'
import { fetchRoles } from '@/redux/slices/roleSlice'
import type { User } from '@/types/auth.types'

interface UserRoleDialogProps {
  open: boolean
  user: User | null
  onClose: () => void
  onSuccess: () => void
}

const UserRoleDialog = ({ open, user, onClose, onSuccess }: UserRoleDialogProps) => {
  const dispatch = useAppDispatch()
  const { isLoading } = useAppSelector(state => state.users)
  const { roles } = useAppSelector(state => state.roles)

  const [selectedRoleId, setSelectedRoleId] = useState<number | ''>('')

  useEffect(() => {
    dispatch(fetchRoles({ limit: 100 }))
  }, [dispatch])

  useEffect(() => {
    if (user && user.roleId) {
      setSelectedRoleId(user.roleId)
    } else {
      setSelectedRoleId('')
    }
  }, [user])

  const handleSubmit = async () => {
    if (!user || !selectedRoleId) return

    const result = await dispatch(changeUserRole({ userId: user.id, payload: { roleId: Number(selectedRoleId) } }))

    if (changeUserRole.fulfilled.match(result)) {
      onSuccess()
      onClose()
    }
  }

  const currentRole = roles.find(r => r.id === user?.roleId)
  const newRole = roles.find(r => r.id === selectedRoleId)

  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
      <DialogTitle>Thay đổi vai trò</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 3 }}>
          Thay đổi vai trò của <strong>{user?.name}</strong>
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          Vai trò hiện tại: <strong>{currentRole?.displayName || 'Chưa xác định'}</strong>
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Vai trò mới</InputLabel>
          <Select
            value={selectedRoleId}
            label='Vai trò mới'
            onChange={e => setSelectedRoleId(e.target.value as number)}
          >
            {roles.map(role => (
              <MenuItem key={role.id} value={role.id}>
                {role.displayName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {selectedRoleId !== user?.roleId && newRole && (
          <Typography variant='body2' color='warning.main' sx={{ mt: 2 }}>
            {`Vai trò sẽ thay đổi từ "${currentRole?.displayName || '...'}" thành "${newRole.displayName}"`}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Hủy
        </Button>
        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={isLoading || selectedRoleId === user?.roleId || !selectedRoleId}
        >
          {isLoading ? <CircularProgress size={20} /> : 'Xác nhận'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UserRoleDialog
