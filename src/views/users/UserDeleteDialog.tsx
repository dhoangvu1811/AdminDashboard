'use client'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

// Redux Imports
import { useAppSelector } from '@/redux/hooks'
import type { User } from '@/types/auth.types'

interface UserDeleteDialogProps {
  open: boolean
  user: User | null
  multiple: boolean
  count: number
  onClose: () => void
  onConfirm: () => void
}

const UserDeleteDialog = ({ open, user, multiple, count, onClose, onConfirm }: UserDeleteDialogProps) => {
  const { isLoading } = useAppSelector(state => state.users)

  const title = multiple ? `Xóa ${count} người dùng?` : 'Xóa người dùng?'

  const content = multiple
    ? `Bạn có chắc chắn muốn xóa ${count} người dùng đã chọn? Hành động này không thể hoàn tác.`
    : `Bạn có chắc chắn muốn xóa người dùng "${user?.name}"? Hành động này không thể hoàn tác.`

  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
      <DialogTitle sx={{ color: 'error.main' }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Hủy
        </Button>
        <Button variant='contained' color='error' onClick={onConfirm} disabled={isLoading}>
          {isLoading ? <CircularProgress size={20} /> : 'Xóa'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UserDeleteDialog
