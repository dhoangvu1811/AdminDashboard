import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

import type { Permission } from '@/types/role.types'

interface PermissionDeleteDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  permission: Permission | null
}

const PermissionDeleteDialog = ({ open, onClose, onConfirm, permission }: PermissionDeleteDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Xóa quyền hạn</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Bạn có chắc chắn muốn xóa quyền hạn "{permission?.displayName || permission?.name}"? Thao tác này không thể
          hoàn tác.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='secondary'>
          Hủy
        </Button>
        <Button onClick={onConfirm} color='error' variant='contained'>
          Xóa
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PermissionDeleteDialog
